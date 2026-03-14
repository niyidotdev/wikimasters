import { eq } from "drizzle-orm";
import db from "@/db/index";
import { articles } from "@/db/schema";

export const authorizeUserToEditArticle = async function authorizeArticle(
  loggedInUserId: string,
  articleId: number,
): Promise<boolean> {
  try {
    const response = await db
      .select({
        authorId: articles.authorId,
      })
      .from(articles)
      .where(eq(articles.id, articleId));

    if (!response.length) {
      return false;
    }

    return response[0].authorId === loggedInUserId;
  } catch (error) {
    console.error("❌ Error authorizing user to edit article:", error);
    return false;
  }
};
