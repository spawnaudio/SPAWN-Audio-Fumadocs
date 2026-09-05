import { Link } from "fumapress/client";

export function RelatedWiki({ links }: { links: string[] }) {
  if (!links.length) return null;

  return (
    <aside className="mt-10 rounded-xl border border-fd-border bg-fd-secondary/30 p-4">
      <h2 className="mb-2 text-sm font-medium tracking-wide text-fd-muted-foreground uppercase">
        Related Wiki
      </h2>
      <ul className="flex flex-col gap-1">
        {links.map((href) => (
          <li key={href}>
            <Link
              href={href}
              className="text-fd-foreground underline-offset-4 hover:underline"
            >
              {href}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
