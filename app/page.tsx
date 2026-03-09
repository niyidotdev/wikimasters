import { WikiCard } from "@/components/wiki-card";
import { getArticles } from "@/lib/data/articles";

export default async function Home() {
  const articles = await getArticles();

  return (
    <div>
      <main className="mx-auto mt-10 flex max-w-2xl flex-col gap-6 px-4 pb-10">
        {articles.length > 0 ? (
          articles.map(({ title, id, createdAt, content, author }) => (
            <WikiCard
              title={title}
              author={author ? author : "Unknown"}
              date={createdAt.toLocaleString()}
              summary={content.substring(0, 200)} // temporary
              href={`/wiki/${id}`}
              key={id}
            />
          ))
        ) : (
          <h2 className="text-center text-gray-500">
            No articles found. Be the first to create one!
          </h2>
        )}
      </main>
    </div>
  );
}
