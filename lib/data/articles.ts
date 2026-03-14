import db from "@/db/index";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { usersSync } from "@/db/schema";
import { desc } from "drizzle-orm";
import redis from "@/cache";

export type ArticleList = {
  id: number;
  title: string;
  createdAt: string;
  content: string;
  author: string | null;
  imageUrl?: string | null;
};

export async function getArticles() {
  try {
    const cached = await redis.get<ArticleList[]>("articles:all");
    if (cached) {
      console.log("Cache hit for articles");
      return cached;
    }
    console.log("Cache miss for articles, querying database");

    const response = await db
      .select({
        title: articles.title,
        id: articles.id,
        createdAt: articles.createdAt,
        content: articles.content,
        author: usersSync.name,
      })
      .from(articles)
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
      .orderBy(desc(articles.createdAt));

    const normalised = response.map((article) => ({
      ...article,
      createdAt:
        article.createdAt instanceof Date
          ? article.createdAt.toISOString()
          : String(article.createdAt),
    }));

    redis.set("articles:all", normalised, {
      ex: 60, // Cache for 60 seconds
    });

    return normalised;
  } catch (error) {
    console.log("Error in fetching articles", error);
    return [];
  }
}

export type ArticleWithAuthor = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  author: string | null;
};

export async function getArticleById(id: number) {
  try {
    const response = await db
      .select({
        title: articles.title,
        id: articles.id,
        createdAt: articles.createdAt,
        content: articles.content,
        imageUrl: articles.imageUrl,
        author: usersSync.name,
      })
      .from(articles)
      .where(eq(articles.id, id))
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

    return response[0] ? (response[0] as unknown as ArticleWithAuthor) : null;
  } catch (error) {
    console.error("Error fetching article", error);
    return null;
  }
}
