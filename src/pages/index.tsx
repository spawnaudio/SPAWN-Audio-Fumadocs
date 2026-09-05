import { Link } from "fumapress/client";
import { getPressContext } from "../../press.config";
import { HubCards } from "../components/hub-cards";

export default async function HomePage() {
  const loader = await getPressContext().getLoader();
  const pages = loader.getPages();

  const recentBlog = pages
    .filter(
      (page) =>
        page.url.startsWith("/blog/") &&
        page.url !== "/blog" &&
        !page.url.startsWith("/blog/tags"),
    )
    .slice(0, 5);

  const pinnedWiki = [
    { href: "/spawn/projects/active", label: "Active projects" },
    { href: "/spawn/workflows", label: "Workflows" },
    { href: "/spawn/sops", label: "SOPs" },
    { href: "/study/practical-bridges", label: "Study bridges" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="text-sm tracking-[0.2em] text-fd-muted-foreground uppercase">
          [SPAWN] Audio
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Studio wiki, writing, and study — kept in separate silos, linked on
          purpose.
        </h1>
        <p className="max-w-2xl text-lg text-fd-muted-foreground">
          Procedural docs for client work, a personal blog for session notes and
          deep-dives, and university material with bridges back into the room.
        </p>
      </header>

      <HubCards />

      <section className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-medium">Recent writing</h2>
          <ul className="flex flex-col gap-2">
            {recentBlog.length === 0 ? (
              <li className="text-fd-muted-foreground text-sm">
                No posts yet.
              </li>
            ) : (
              recentBlog.map((post) => (
                <li key={post.url}>
                  <Link
                    href={post.url}
                    className="underline-offset-4 hover:underline"
                  >
                    {post.data.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/blog"
            className="text-sm text-fd-muted-foreground underline-offset-4 hover:underline"
          >
            All posts →
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-medium">Pinned wiki</h2>
          <ul className="flex flex-col gap-2">
            {pinnedWiki.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
