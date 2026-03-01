import { WikiCard } from "@/components/wiki-card";
import { getArticles } from "@/lib/data/articles";

export default async function Home() {
  const articles = await getArticles();

  return (
    <div>
      <main className="mx-auto mt-10 flex max-w-2xl flex-col gap-6">
        {articles.map(({ title, id, createdAt, content, author }) => (
          <WikiCard
            title={title}
            author={author ? author : "Unknown"}
            date={`${createdAt.toLocaleDateString("en-US")} ${createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
            summary={content.substring(0, 200)} // temporary
            href={`/wiki/${id}`}
            key={id}
          />
        ))}
      </main>
    </div>
  );
}
