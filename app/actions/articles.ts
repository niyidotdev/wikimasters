"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { authorizeUserToEditArticle } from "@/db/authz";
import db from "@/db/index";
import { articles } from "@/db/schema";
import { ensureUserExists } from "@/db/sync-user";
import { stackServerApp } from "@/stack/server";
import redis from "@/cache";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  try {
    await ensureUserExists(user);

    console.log("✨ createArticle called:", data);

    const article = await db
      .insert(articles)
      .values({
        title: data.title,
        content: data.content,
        slug: `${Date.now()}`,
        published: true,
        authorId: user.id,
        imageUrl: data.imageUrl ?? undefined,
      })
      .returning();

    await redis.del("articles:all");

    return {
      success: true,
      message: "Article create logged",
      id: article[0]?.id,
    };
  } catch (error) {
    console.error("❌ Error creating article:", error);
    throw new Error("Failed to create article");
  }
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("❌ Forbidden");
  }

  console.log("📝 updateArticle called:", { id, ...data });

  try {
    await db
      .update(articles)
      .set({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      })
      .where(eq(articles.id, +id));

    await redis.del("articles:all");

    return { success: true, message: `Article ${id} update logged`, id };
  } catch (error) {
    console.error("❌ Error updating article:", error);
    throw new Error(`Failed to update article ${id}`);
  }
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("❌ Forbidden");
  }

  console.log("🗑️ deleteArticle called:", id);

  try {
    await db.delete(articles).where(eq(articles.id, +id));

    await redis.del("articles:all");

    return { success: true, message: `Article ${id} delete logged` };
  } catch (error) {
    console.error("❌ Error deleting article:", error);
    throw new Error(`Failed to delete article ${id}`);
  }
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle.
// Note: redirect() must remain outside any try-catch as Next.js implements it by throwing
// a special internal error that must not be swallowed.
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  redirect("/");
}
