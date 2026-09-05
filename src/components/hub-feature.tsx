import { Link } from "fumapress/client";

type FeaturedPost = {
  url: string;
  title: string;
  description?: string;
  date?: string;
};

type HubFeatureProps = {
  featured: FeaturedPost | null;
  morePosts: FeaturedPost[];
};

export function HubFeature({ featured, morePosts }: HubFeatureProps) {
  return (
    <section className="grid gap-10 border-t border-fd-border pt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col gap-5">
        <p className="text-xs tracking-[0.25em] text-fd-muted-foreground uppercase">
          Latest
        </p>
        {featured ? (
          <>
            <h2 className="editorial-display max-w-xl text-3xl font-medium leading-tight md:text-4xl">
              <Link
                href={featured.url}
                className="transition-colors hover:text-fd-primary"
              >
                {featured.title}
              </Link>
            </h2>
            {featured.description ? (
              <p className="editorial-measure text-base leading-relaxed text-fd-muted-foreground md:text-lg">
                {featured.description}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
              {featured.date ? (
                <time className="text-fd-muted-foreground">{featured.date}</time>
              ) : null}
              <Link
                href={featured.url}
                className="text-fd-primary underline-offset-4 hover:underline"
              >
                Read →
              </Link>
            </div>
          </>
        ) : (
          <p className="text-fd-muted-foreground">No posts yet.</p>
        )}
      </div>

      <aside className="flex flex-col gap-8 border-t border-fd-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
        <div className="flex flex-col gap-3">
          <p className="text-xs tracking-[0.25em] text-fd-muted-foreground uppercase">
            Elsewhere
          </p>
          <ul className="flex flex-col gap-2 text-base">
            <li>
              <Link
                href="/spawn"
                className="underline-offset-4 hover:text-fd-primary hover:underline"
              >
                SPAWN Wiki
              </Link>
              <span className="mt-0.5 block text-sm text-fd-muted-foreground">
                Workflows, SOPs, project hubs
              </span>
            </li>
            <li>
              <Link
                href="/study"
                className="underline-offset-4 hover:text-fd-primary hover:underline"
              >
                Study
              </Link>
              <span className="mt-0.5 block text-sm text-fd-muted-foreground">
                Modules and practical bridges
              </span>
            </li>
            <li>
              <Link
                href="/blog"
                className="underline-offset-4 hover:text-fd-primary hover:underline"
              >
                All writing
              </Link>
              <span className="mt-0.5 block text-sm text-fd-muted-foreground">
                Blog index and tags
              </span>
            </li>
          </ul>
        </div>

        {morePosts.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-[0.25em] text-fd-muted-foreground uppercase">
              More writing
            </p>
            <ul className="flex flex-col gap-2">
              {morePosts.map((post) => (
                <li key={post.url}>
                  <Link
                    href={post.url}
                    className="text-sm underline-offset-4 hover:text-fd-primary hover:underline"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
