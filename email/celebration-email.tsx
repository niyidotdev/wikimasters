import resend from "@/email";
import db from "@/db";
import { usersSync } from "@/db/schema";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import CelebrationTemplate from "./templates/celebration-template";

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:3000`;

export default async function sendCelebrationEmail(
  articleId: number,
  pageviews: number,
) {
  const response = await db
    .select({
      email: usersSync.email,
      id: usersSync.id,
      title: articles.title,
      name: usersSync.name,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
    .where(eq(articles.id, articleId));

  const { email, id, name, title } = response[0];

  if (!email) {
    console.error("No email found for user with id:", id);
    return;
  }

  // const emailRes = await resend.emails.send({
  //   from: "Wikimasters <noreply@mail.zeit.dev>",
  //   to: email,
  //   subject: `Your article just hit ${pageviews} pageviews!`,
  //   html: "<h1>Congrats!</h1><p>You're an amazing author and people like you</p>",
  // });

  const emailRes = await resend.emails.send({
    from: "Wikimasters <onboarding@resend.dev>",
    to: "akandefortunatus2021@gmail.com",
    subject: `Your article just hit ${pageviews} views!`,
    react: (
      <CelebrationTemplate
        articleTitle={title}
        articleUrl={`${BASE_URL}/wiki/${articleId}`}
        name={name ?? "Friend"}
        pageviews={pageviews}
      />
    ),
  });

  if (!emailRes.error) {
    console.log(
      `Sent ${id} a celebration email for getting ${pageviews} on article ${articleId}`,
    );
  } else {
    console.error(
      `Error sending email to ${email} for user ${id}:`,
      emailRes.error,
    );
  }
}
