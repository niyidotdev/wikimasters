import db from "@/db/index";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { usersSync } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getArticles() {
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

  return response;
}

export async function getArticleById(id: number) {
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

  return response[0] ? response[0] : null;
}
