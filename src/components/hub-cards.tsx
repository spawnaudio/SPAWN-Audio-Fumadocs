import { Link } from "fumapress/client";

const silos = [
  {
    href: "/spawn",
    label: "SPAWN Wiki",
    description:
      "Workflows, SOPs, project hubs, and business docs — the procedural side of the studio.",
  },
  {
    href: "/blog",
    label: "Blog",
    description:
      "Session notes, experiments, and longer writeups in a looser voice — with links back into the wiki.",
  },
  {
    href: "/study",
    label: "Study",
    description:
      "University modules and lecture notes, plus practical bridges into real studio work.",
  },
] as const;

export function HubCards() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {silos.map((silo) => (
        <Link
          key={silo.href}
          href={silo.href}
          className="group rounded-2xl border border-fd-border bg-fd-card/40 p-5 transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/20"
        >
          <h2 className="text-lg font-medium group-hover:text-fd-primary">
            {silo.label}
          </h2>
          <p className="mt-2 text-sm text-fd-muted-foreground">
            {silo.description}
          </p>
        </Link>
      ))}
    </section>
  );
}
