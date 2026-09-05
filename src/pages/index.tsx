import { getPressContext } from "../../press.config";
import { HubFeature } from "../components/hub-feature";

function formatDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function postDateValue(data: Record<string, unknown>): number {
  const raw = data.date;
  if (!raw) return 0;
  const date = raw instanceof Date ? raw : new Date(String(raw));
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export default async function HomePage() {
  const loader = await getPressContext().getLoader();
  const pages = loader.getPages();

  const blogPosts = pages
    .filter(
      (page) =>
        page.url.startsWith("/blog/") &&
        page.url !== "/blog" &&
        !page.url.startsWith("/blog/tags"),
    )
    .map((page) => {
      const data = page.data as Record<string, unknown>;
      return {
        url: page.url,
        title: String(data.title ?? page.url),
        description:
          typeof data.description === "string" ? data.description : undefined,
        date: formatDate(data.date),
        sortValue: postDateValue(data),
      };
    })
    .sort((a, b) => b.sortValue - a.sortValue);

  const featured = blogPosts[0]
    ? {
        url: blogPosts[0].url,
        title: blogPosts[0].title,
        description: blogPosts[0].description,
        date: blogPosts[0].date,
      }
    : null;

  const morePosts = blogPosts.slice(1, 4).map(({ url, title, description, date }) => ({
    url,
    title,
    description,
    date,
  }));

  return (
    <main className="editorial-surface mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 md:py-28">
      <header className="flex max-w-3xl flex-col gap-6">
        <p className="text-sm tracking-[0.28em] text-fd-muted-foreground uppercase">
          [SPAWN] Audio
        </p>
        <h1 className="editorial-display text-4xl font-medium leading-[1.1] md:text-6xl">
          Notes from the room.
        </h1>
        <p className="editorial-measure text-lg leading-relaxed text-fd-muted-foreground md:text-xl">
          Writing from sessions and study — with a quieter wiki behind it for
          the work that needs to stay precise.
        </p>
      </header>

      <HubFeature featured={featured} morePosts={morePosts} />
    </main>
  );
}
