# [SPAWN] Audio Docs Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold and ship a public, solo-author Fumapress site with three siloed content areas — SPAWN Wiki (`/spawn`), Blog (`/blog`), and Study (`/study`) — plus a hub landing page, cross-linking, and static deploy readiness.

**Architecture:** One Fumapress (Waku/Vite) app with three `defineDocs()` MDX collections registered in `press.config.tsx`. Wiki and Study use the docs layout; Blog uses `blogPlugin()`. Hub landing is a custom React page at `src/pages/index.tsx`. Static mode for CDN hosting.

**Tech Stack:** Fumapress (`fumapress`), Fumadocs MDX, Tailwind CSS v4, TypeScript, Node 22+, static deploy (Vercel/Cloudflare Pages).

**Spec:** `docs/superpowers/specs/2026-09-02-spawn-audio-docs-site-design.md`

## Global Constraints

- Package: `fumapress` (CLI: `fumapress`; create: `npm create fumapress`)
- Config file: `press.config.tsx` (not `press.config.tsx` aliases from older docs)
- Content collections live under `content/{spawn,blog,study}/`
- Sidebar order via `meta.json` (Fumapress page-tree convention)
- Public site, no auth; `mode: "static"`
- Site name: `[SPAWN] Audio`
- Navbar links: Wiki → `/spawn`, Blog → `/blog`, Study → `/study`
- Do not invent SPAWN brand colors beyond a neutral accent; keep theming minimal in v1
- Prefer committing after each task

---

## File Map

| Path | Responsibility |
|---|---|
| `press.config.tsx` | Site config, 3 content sources, blog plugin, layout switching, nav |
| `vite.config.ts` | Vite + fumapress + fumadocs-mdx + tailwind plugins |
| `src/app.css` | Theme imports + light SPAWN accent tokens |
| `src/pages/index.tsx` | Hub landing page |
| `src/pages/_layout.tsx` | Home layout for file-based routes |
| `src/components/related-wiki.tsx` | Renders `wiki_links` frontmatter on blog posts |
| `src/components/hub-cards.tsx` | Silo cards + recent activity for hub |
| `content/spawn/**` | Wiki MDX + meta.json |
| `content/blog/**` | Blog MDX |
| `content/study/**` | Study MDX + meta.json |
| `package.json` | Scripts: `dev`, `build`, `start`, `types:check` |
| `README.md` | How to run / deploy |

---

### Task 1: Scaffold Fumapress app

**Files:**
- Create: `package.json`, `press.config.tsx`, `vite.config.ts`, `tsconfig.json`, `src/app.css`, and starter content from CLI
- Modify: replace starter single-collection config in later tasks

**Interfaces:**
- Produces: runnable `npm run dev` / `npm run build` Fumapress app

- [ ] **Step 1: Create the app in the repo root**

The repo currently only has `README.md` and `docs/`. Scaffold into a temp dir then move files up so we keep existing docs:

```bash
cd /workspace
npm create fumapress@latest spawn-scaffold -- --yes
# If the CLI is interactive and --yes is unsupported, use defaults via printf/echo.
# Inspect what was generated:
ls -la spawn-scaffold
```

If non-interactive flags fail, manually scaffold using the documented manual install from https://press.fumadocs.dev/docs (install deps, write `vite.config.ts`, `press.config.tsx`, `package.json` scripts).

Move generated files into `/workspace` (do not overwrite `docs/` or `.git`):

```bash
# Example move — adjust to actual scaffold output
shopt -s dotglob
for item in spawn-scaffold/*; do
  base=$(basename "$item")
  if [[ "$base" == "docs" || "$base" == ".git" ]]; then continue; fi
  if [[ -e "/workspace/$base" && "$base" != "README.md" ]]; then
    echo "conflict: $base"; continue
  fi
  mv "$item" /workspace/
done
rm -rf spawn-scaffold
```

- [ ] **Step 2: Install dependencies**

```bash
cd /workspace
npm install
```

Expected: `node_modules/` present; no peer dependency fatal errors.

- [ ] **Step 3: Smoke the default scaffold**

```bash
npm run build
```

Expected: build succeeds (exit 0). If it fails, fix scaffold issues before continuing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Fumapress app"
```

---

### Task 2: Configure three content collections + blog plugin

**Files:**
- Modify: `press.config.tsx`
- Create: `content/spawn/index.mdx`, `content/spawn/meta.json`
- Create: `content/study/index.mdx`, `content/study/meta.json`
- Create: `content/blog/hello-world.mdx`
- Delete/retire: any default `content/docs` or `content/index.mdx` from scaffold that conflicts

**Interfaces:**
- Consumes: Fumapress `defineConfig`, `defineDocs` from `fumadocs-mdx/macro`, `blogPlugin`
- Produces:
  - Content source keys: `spawn`, `study`, `blog`
  - Routes: `/spawn`, `/study`, `/blog`, `/blog/hello-world`

- [ ] **Step 1: Write `press.config.tsx`**

Replace with (adjust import paths if scaffold differs — verify against installed package exports):

```tsx
import { defineConfig } from "fumapress";
import { fumadocsMdx } from "fumapress/adapters/mdx";
import { blogMetaSchema, blogPageSchema } from "fumapress/adapters/mdx/schema";
import { blogPlugin } from "fumapress/plugins/blog";
import { defineDocs } from "fumadocs-mdx/macro";
import { createDocsLayoutPage } from "fumapress/layouts/docs";

const spawn = defineDocs({
  dir: "content/spawn",
  docs: { async: true },
});

const study = defineDocs({
  dir: "content/study",
  docs: { async: true },
});

const blog = defineDocs({
  dir: "content/blog",
  docs: {
    async: true,
    schema: blogPageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: blogMetaSchema,
  },
});

const DocsPage = createDocsLayoutPage<typeof config.$context>();

const config = defineConfig({
  mode: "static",
  site: {
    name: "[SPAWN] Audio",
    baseUrl: import.meta.env.DEV
      ? "http://localhost:3000"
      : "https://spawn-audio.vercel.app",
    git: {
      user: "spawnaudio",
      repo: "SPAWN-Audio-Fumadocs",
      branch: "main",
    },
  },
  content: {
    spawn: spawn.toFumadocsSource({ baseDir: "spawn" }),
    study: study.toFumadocsSource({ baseDir: "study" }),
    blog: blog.toFumadocsSource({ baseDir: "blog" }),
  },
  defaultLayoutProps: {
    nav: {
      title: "[SPAWN] Audio",
    },
    links: [
      { text: "Wiki", url: "/spawn" },
      { text: "Blog", url: "/blog" },
      { text: "Study", url: "/study" },
    ],
  },
  renderPage: (props) => <DocsPage {...props} />,
})
  .plugins(
    blogPlugin({
      paths: {
        index: "/blog",
        tags: "/blog/tags",
      },
    }),
  )
  .adapters(fumadocsMdx());

export const { getPressContext } = config.utils();
export default config;
```

**Note:** If the installed Fumapress version uses slightly different export names (`createDocsLayoutPage` vs `createDocsLayout`, `config.utils()` vs `config.utils`, `adapters` chaining), match the **installed package** docs/types. Prefer TypeScript errors as the source of truth.

- [ ] **Step 2: Create minimal content so routes resolve**

`content/spawn/index.mdx`:

```mdx
---
title: SPAWN Wiki
description: Workflows, SOPs, projects, and business docs for [SPAWN] audio work.
icon: AudioLines
---

Welcome to the SPAWN Wiki — the procedural home for studio workflows, project hubs, and reference material.

## Start here

- [Onboarding](/spawn/onboarding) — tools, conventions, and how this wiki is organized
- [Workflows](/spawn/workflows) — end-to-end processes
- [Active projects](/spawn/projects/active) — project hubs
```

`content/spawn/meta.json`:

```json
{
  "title": "SPAWN Wiki",
  "pages": [
    "index",
    "onboarding",
    "workflows",
    "sops",
    "projects",
    "business",
    "templates",
    "reference"
  ]
}
```

`content/study/index.mdx`:

```mdx
---
title: Study
description: University modules, lecture notes, and practical bridges into studio work.
icon: GraduationCap
---

Course notes and study material, kept separate from client work — with deliberate bridges back into the SPAWN Wiki.
```

`content/study/meta.json`:

```json
{
  "title": "Study",
  "pages": ["index", "modules", "semesters", "reading", "exams", "practical-bridges"]
}
```

`content/blog/hello-world.mdx`:

```mdx
---
title: Hello from the studio
description: First post — what this blog is for
date: 2026-09-05
tags: [meta, spawn]
wiki_links:
  - /spawn
---

## Why this exists

Quick writeups, session braindumps, and longer deep-dives — written in a looser voice than the wiki.

When something stabilizes into a real process, it graduates into a [wiki SOP or workflow](/spawn).
```

- [ ] **Step 3: Remove conflicting scaffold content**

Delete leftover `content/docs/**` or root `content/index.mdx` if they clash with the hub page or new collections.

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: exit 0. Routes for `/spawn`, `/study`, `/blog` exist in build output or succeed under `npm run dev`.

- [ ] **Step 5: Commit**

```bash
git add press.config.tsx content package.json package-lock.json
git commit -m "feat: wire spawn, study, and blog content collections"
```

---

### Task 3: Wiki IA skeleton (SPAWN)

**Files:**
- Create: section index pages + `meta.json` under `content/spawn/{onboarding,workflows,sops,projects,business,templates,reference}/`
- Create: example project hub + example SOP + example workflow

**Interfaces:**
- Produces: navigable sidebar matching the design IA

- [ ] **Step 1: Create section indexes**

For each section folder, add `index.mdx` + `meta.json` where children exist. Minimum pages:

| Path | Title |
|---|---|
| `content/spawn/onboarding/index.mdx` | Onboarding |
| `content/spawn/onboarding/tools-and-conventions.mdx` | Tools & Conventions |
| `content/spawn/workflows/index.mdx` | Workflows |
| `content/spawn/workflows/client-intake.mdx` | Client Intake |
| `content/spawn/workflows/editing-mixing.mdx` | Editing & Mixing |
| `content/spawn/workflows/delivery-handoff.mdx` | Delivery & Handoff |
| `content/spawn/sops/index.mdx` | SOPs |
| `content/spawn/sops/file-naming.mdx` | File Naming |
| `content/spawn/sops/quality-checklist.mdx` | Quality Checklist |
| `content/spawn/projects/index.mdx` | Projects |
| `content/spawn/projects/active/index.mdx` | Active Projects |
| `content/spawn/projects/active/example-album-mix.mdx` | Example — Album Mix |
| `content/spawn/projects/archive/index.mdx` | Archive |
| `content/spawn/business/index.mdx` | Business |
| `content/spawn/business/rate-card.mdx` | Rate Card |
| `content/spawn/templates/index.mdx` | Templates |
| `content/spawn/templates/session-notes.mdx` | Session Notes |
| `content/spawn/reference/index.mdx` | Reference |
| `content/spawn/reference/gear-inventory.mdx` | Gear Inventory |
| `content/spawn/reference/room-treatment.mdx` | Room Treatment |

Each index should be 1 short paragraph + links to children. Each leaf page should have enough body to demonstrate tone (procedural for SOPs/workflows; hub template for the example project).

Example project hub frontmatter:

```yaml
---
title: Example — Album Mix
description: Template project hub showing how client work is tracked in the wiki.
status: active
client: Example Client
sops:
  - /spawn/sops/file-naming
  - /spawn/sops/quality-checklist
workflows:
  - /spawn/workflows/editing-mixing
  - /spawn/workflows/delivery-handoff
related_blog:
  - /blog/hello-world
tags: [mixing, example]
---
```

Body sections: Overview, Status & notes, Linked procedures, Related writing.

- [ ] **Step 2: Add `meta.json` for each folder with children**

Example `content/spawn/workflows/meta.json`:

```json
{
  "title": "Workflows",
  "pages": ["index", "client-intake", "editing-mixing", "delivery-handoff"]
}
```

Example `content/spawn/projects/meta.json`:

```json
{
  "title": "Projects",
  "pages": ["index", "active", "archive"]
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add content/spawn
git commit -m "feat: add SPAWN wiki information architecture skeleton"
```

---

### Task 4: Study IA skeleton

**Files:**
- Create: `content/study/modules/**`, `semesters/**`, `reading/**`, `exams/**`, `practical-bridges/**`

- [ ] **Step 1: Create study tree**

| Path | Title |
|---|---|
| `content/study/modules/index.mdx` | Modules |
| `content/study/modules/acoustics/index.mdx` | Acoustics |
| `content/study/modules/acoustics/lecture-01-waves.mdx` | Lecture 01 — Waves |
| `content/study/modules/acoustics/lecture-02-room-modes.mdx` | Lecture 02 — Room Modes |
| `content/study/semesters/index.mdx` | Semesters |
| `content/study/semesters/2026-spring.mdx` | 2026 Spring |
| `content/study/reading/index.mdx` | Reading |
| `content/study/reading/bibliography.mdx` | Bibliography |
| `content/study/exams/index.mdx` | Exams |
| `content/study/exams/acoustics-midterm-prep.mdx` | Acoustics Midterm Prep |
| `content/study/practical-bridges/index.mdx` | Practical Bridges |
| `content/study/practical-bridges/room-modes-lab-to-studio.mdx` | Room Modes — Lab to Studio |

Practical bridge frontmatter:

```yaml
---
title: Room Modes — Lab to Studio
description: Connecting acoustics lecture material to the studio treatment plan.
study_refs:
  - /study/modules/acoustics/lecture-02-room-modes
wiki_refs:
  - /spawn/reference/room-treatment
blog_refs:
  - /blog/hello-world
tags: [acoustics, bridge]
---
```

- [ ] **Step 2: Wire `meta.json` files for study folders**

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add content/study
git commit -m "feat: add study section information architecture skeleton"
```

---

### Task 5: Hub landing page + home layout

**Files:**
- Create: `src/pages/index.tsx`, `src/pages/_layout.tsx`, `src/components/hub-cards.tsx`
- Modify: `press.config.tsx` (export `HomeLayout`, ensure hub doesn't conflict with content `/`)

**Interfaces:**
- Consumes: `getPressContext().getLoader()` for recent pages
- Produces: `/` hub with three silo cards + recent blog posts

- [ ] **Step 1: Export HomeLayout from config**

In `press.config.tsx`:

```tsx
import { createHomeLayout } from "fumapress/layouts/home";

export const HomeLayout = createHomeLayout<typeof config.$context>();
```

(`config` must be declared before this export — reorder if needed, or use a two-step pattern matching installed API.)

- [ ] **Step 2: Apply home layout to file-based routes**

`src/pages/_layout.tsx`:

```tsx
export { HomeLayout as default } from "../../press.config";
```

- [ ] **Step 3: Build hub components + page**

`src/components/hub-cards.tsx` — three cards linking to `/spawn`, `/blog`, `/study` with short descriptions matching the design tone.

`src/pages/index.tsx`:

```tsx
import { Link } from "fumapress/client";
import { getPressContext } from "../../press.config";
import { HubCards } from "../components/hub-cards";

export default async function HomePage() {
  const loader = await getPressContext().getLoader();
  const pages = loader.getPages();

  const recentBlog = pages
    .filter((p) => p.url.startsWith("/blog/") && p.url !== "/blog")
    .slice(0, 3);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-widest text-fd-muted-foreground">
          [SPAWN] Audio
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Studio wiki, writing, and study — in one place.
        </h1>
        <p className="max-w-2xl text-fd-muted-foreground">
          Procedural docs for client work, a personal blog for session notes and
          deep-dives, and a university section with bridges back into the studio.
        </p>
      </header>

      <HubCards />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Recent writing</h2>
        <ul className="flex flex-col gap-2">
          {recentBlog.map((post) => (
            <li key={post.url}>
              <Link href={post.url} className="underline-offset-4 hover:underline">
                {post.data.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
```

Adjust `getLoader` / page shape to match installed types if names differ (`getPages` vs `getPageTree` children).

- [ ] **Step 4: Ensure no content route owns `/`**

Content collections all use `baseDir`, so `/` should be free for `src/pages/index.tsx`.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src press.config.tsx
git commit -m "feat: add hub landing page with silo cards"
```

---

### Task 6: Cross-linking UI (Related Wiki panel)

**Files:**
- Create: `src/components/related-wiki.tsx`
- Modify: `press.config.tsx` blog plugin `layouts.page` to inject Related Wiki panel
- Modify: `content/blog/hello-world.mdx` (already has `wiki_links`)
- Create: one more blog post that links to a project hub

**Interfaces:**
- Consumes: page frontmatter `wiki_links: string[]`
- Produces: related-links panel under blog post body

- [ ] **Step 1: Related Wiki component**

```tsx
import { Link } from "fumapress/client";

export function RelatedWiki({ links }: { links: string[] }) {
  if (!links?.length) return null;

  return (
    <aside className="mt-10 rounded-lg border border-fd-border bg-fd-secondary/40 p-4">
      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-fd-muted-foreground">
        Related Wiki
      </h2>
      <ul className="flex flex-col gap-1">
        {links.map((href) => (
          <li key={href}>
            <Link href={href} className="text-fd-foreground underline-offset-4 hover:underline">
              {href}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

(v1 shows URLs; optional enhancement later: resolve titles via loader.)

- [ ] **Step 2: Wire into blog page layout**

Use `blogPlugin({ layouts: { page: ... } })` wrapping the default blog page and appending `<RelatedWiki links={props.page.data.wiki_links ?? []} />`.

If `wiki_links` is stripped by schema, extend the blog page schema:

```ts
import { blogPageSchema } from "fumapress/adapters/mdx/schema";
import { z } from "zod";

schema: blogPageSchema.extend({
  wiki_links: z.array(z.string()).optional(),
  project: z.string().optional(),
}),
```

(Confirm zod is available via fumadocs-mdx; if schema API differs, follow package types.)

- [ ] **Step 3: Add a second blog post with richer links**

`content/blog/vocal-chain-notes.mdx` linking to `/spawn/workflows/editing-mixing`, `/spawn/sops/quality-checklist`, and the example project hub.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src press.config.tsx content/blog
git commit -m "feat: add Related Wiki panel for blog posts"
```

---

### Task 7: Light theming + README

**Files:**
- Modify: `src/app.css`
- Modify: `README.md`

- [ ] **Step 1: Accent tokens**

Keep Fumadocs neutral/black presets. Add a single accent (avoid purple/cream AI-default looks — prefer a cool steel/teal or warm amber against dark/neutral):

```css
@import "tailwindcss";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/black.css";
@import "fumadocs-ui/css/preset.css";
@import "fumapress/css/preset.css";

@theme {
  --color-fd-primary: hsl(185 45% 42%);
}
```

Adjust import paths to match scaffold.

- [ ] **Step 2: Rewrite README**

Document:
- What the three silos are
- `npm install` / `npm run dev` / `npm run build`
- Content folder map
- Deploy notes (`mode: "static"`, Vercel/Cloudflare)

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/app.css README.md
git commit -m "docs: theme accent and project README"
```

---

### Task 8: Final verification + PR update

- [ ] **Step 1: Clean build**

```bash
rm -rf dist .output .waku 2>/dev/null; npm run build
```

Expected: exit 0.

- [ ] **Step 2: Typecheck if available**

```bash
npm run types:check || npx tsc --noEmit
```

Fix any errors introduced by config/components.

- [ ] **Step 3: Spot-check key routes under dev (optional but preferred)**

```bash
npm run dev -- --port 3000
# curl or browse: /, /spawn, /blog, /study, /spawn/projects/active/example-album-mix
```

- [ ] **Step 4: Push and update PR**

```bash
git push -u origin HEAD
```

Update PR body to reflect implementation (not design-only).

---

## Self-Review

| Spec requirement | Task |
|---|---|
| Three siloed collections | Task 2 |
| SPAWN wiki IA + project hubs | Task 3 |
| Blog with relaxed tone + wiki links | Tasks 2, 6 |
| Study + practical bridges | Task 4 |
| Hub landing | Task 5 |
| Static public deploy | Tasks 2 (`mode: "static"`), 7 README |
| Cross-linking | Tasks 3–6 |
| Search / llms | Covered by Fumapress default preset plugins |

**Deferred to follow-ups (explicitly out of this plan):** auth, Obsidian import script, link-validation CI, custom OG images, scoped search UI, full seed content beyond skeleton pages.
