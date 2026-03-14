import db from "@/db/index";
import { usersSync } from "@/db/schema";

type StackUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
};

export async function ensureUserExists(stackUser: StackUser): Promise<void> {
  try {
    await db
      .insert(usersSync)
      .values({
        id: stackUser.id,
        name: stackUser.displayName,
        email: stackUser.primaryEmail,
      })
      .onConflictDoUpdate({
        target: usersSync.id,
        set: {
          name: stackUser.displayName,
          email: stackUser.primaryEmail,
        },
      });
  } catch (error) {
    console.error("❌ Error ensuring user exists:", error);
    throw new Error("Failed to sync user to database");
  }
}
