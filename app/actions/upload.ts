"use server";

import { put } from "@vercel/blob";
import { stackServerApp } from "@/stack/server";

export type UploadedFile = {
  url: string;
  size: number;
  type: string;
  filename?: string;
};

export async function uploadFile(formData: FormData): Promise<UploadedFile> {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      throw new Error("Unauthorized: User must be logged in to upload files");
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      throw error;
    }
    console.error("❌ Error verifying user session:", error);
    throw new Error("Failed to verify user session");
  }

  // Basic validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const files = formData.getAll("files").filter(Boolean) as File[];
  const file = files[0];

  console.log(
    "📤 uploadFile called, received files:",
    files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
  );

  if (!file) {
    throw new Error("No file provided");
  }

  if (!ALLOWED.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return {
      url: blob.url ?? "",
      size: file.size,
      type: file.type,
      filename: blob.pathname ?? file.name,
    };
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw new Error("Upload failed");
  }
}
