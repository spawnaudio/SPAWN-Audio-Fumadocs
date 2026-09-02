# [SPAWN] Audio Documentation Site — Design Spec

**Date:** 2026-09-02  
**Status:** Draft — awaiting review  
**Audience:** Solo author, public site  
**Stack:** Fumapress (Fumadocs + Waku/Vite)

---

## 1. Purpose & Goals

Build a public, personal knowledge site for the [SPAWN] audio practice. The site serves three distinct purposes that must remain visually and structurally siloed while sharing a unified search and cross-linking layer.

| Silo | Purpose | Tone |
|---|---|---|
| **SPAWN Wiki** | Workflows, SOPs, business docs, project hubs | Precise, procedural, reference-grade |
| **Blog** | Task writeups, reflections, braindumps, audio prose | Relaxed, first-person, exploratory |
| **Study** | University modules, lecture notes, assignments | Academic but practically grounded |

### Success criteria

- A visitor (or future you) can land on the hub and reach any silo in one click.
- Within the wiki, you can follow a project from intake → delivery without leaving the silo.
- Blog posts surface relevant wiki pages without manual hunting.
- Study content bridges to real-world SPAWN techniques where applicable.
- Site builds statically and deploys without a server or auth layer.
- Content lives in Git as MDX — editable locally, versioned, portable.

### Non-goals (v1)

- Authentication or private sections
- Multi-user editing / CMS
- Comments or analytics (can add later)
- i18n / multiple languages
- Obsidian live-sync (optional migration path only)

---

## 2. Technical Approach

### Recommendation: Fumapress with three content collections

Fumapress wraps Fumadocs with opinionated routing, layouts, and plugins. For a solo public site with docs + blog + a third section, it minimizes boilerplate compared to raw Fumadocs-on-Next.js.

**Chosen over:**

| Alternative | Why not (for v1) |
|---|---|
| Fumadocs on Next.js | More setup (loaders, catch-all routes, layout wiring) for equivalent outcome |
| Three separate sites | Loses unified search, cross-linking, and single hub |
| Obsidian-primary pipeline | Adds conversion friction unless existing vault is large; keep as migration option |

### Core plugins (v1)

| Plugin | Role |
|---|---|
| `blogPlugin()` | Blog routes, tags, RSS, distinct layout |
| `flexsearchPlugin()` | Full-text search with tag scoping |
| `llmsPlugin()` | `/llms.txt` for AI tooling |
| `sitemapPlugin()` | SEO sitemap |

Optional later: `takumi` (OG images), link validation, RSS enhancements.

### Deployment model

**Static site generation** — no Node server in production.

- **Host:** Vercel (recommended) or Cloudflare Pages
- **Domain:** Custom domain pointing to static build output
- **Repo:** Can remain private; only the built site is public
- **Node:** 22+ (Fumadocs requirement)

---

## 3. Site Architecture

### URL map

| Route | Silo | Layout |
|---|---|---|
| `/` | Hub landing (custom React page) | Home |
| `/spawn/*` | SPAWN Wiki | Docs |
| `/blog` | Blog index | Blog (HomeLayout) |
| `/blog/*` | Blog posts | Blog |
| `/blog/tags` | Tag listing | Blog |
| `/study/*` | University & Study | Docs |

### Top-level navigation

```
┌──────────────────────────────────────────────────────────────┐
│  [SPAWN]          Wiki    Blog    Study         [Search ⌘K]  │
└──────────────────────────────────────────────────────────────┘
```

Navbar is shared across all silos. Search is global by default; silo context can bias results via tags.

### Hub landing page (`src/pages/index.tsx`)

Custom React page — not MDX. Shows:

1. **Hero** — site name, one-line description of [SPAWN] audio practice
2. **Three silo cards** — icon, description, link to silo root
3. **Recent activity** — latest 3 blog posts + recently updated wiki/study pages (via `getPressContext().getLoader()`)
4. **Pinned shortcuts** — configurable list of high-traffic wiki pages (active projects, key SOPs)

This is the only page that spans all silos visually; everything else stays inside its silo.

---

## 4. Content Architecture

### Directory layout

```
content/
├── spawn/                  # Silo 1 — SPAWN Wiki
│   ├── index.mdx           # root: true
│   ├── meta.json
│   ├── onboarding/
│   ├── workflows/
│   ├── sops/
│   ├── projects/
│   │   ├── active/
│   │   └── archive/
│   ├── business/
│   ├── templates/
│   └── reference/
├── blog/                   # Silo 2 — Blog
│   ├── meta.json
│   └── YYYY/               # Optional year folders
│       └── post-slug.mdx
└── study/                  # Silo 3 — Study
    ├── index.mdx           # root: true
    ├── meta.json
    ├── modules/
    ├── semesters/
    ├── reading/
    ├── exams/
    └── practical-bridges/
```

### Silo 1 — SPAWN Wiki (`/spawn`)

**Organized around how work actually flows**, not arbitrary categories.

#### Section tree

```
SPAWN Wiki
├── Onboarding          (tools, access, conventions — for future-you)
├── Workflows           (end-to-end processes)
│   ├── Client intake
│   ├── Session prep
│   ├── Recording
│   ├── Editing & mixing
│   └── Delivery & handoff
├── SOPs                (atomic, reusable procedures)
│   ├── File naming
│   ├── Backup policy
│   ├── Quality checklist
│   └── Revision requests
├── Projects            (hub pages — the connective tissue)
│   ├── Active/
│   └── Archive/
├── Business            (contracts, invoicing, rate card)
├── Templates           (session notes, client brief, etc.)
└── Reference           (gear, plugin chains, room treatment)
```

#### Project hub page (key document type)

Every active project gets a hub page that acts as the single source of truth:

```yaml
---
title: "Client X — Album Mix"
description: "Full album mix, 12 tracks, delivery March 2026"
status: active          # active | on-hold | complete
client: Client X
started: 2026-01-10
sops: [file-naming, quality-checklist]
workflows: [editing-mixing, delivery-handoff]
related_blog: [/blog/2026/vocal-chain-client-x]
tags: [mixing, album, client-x]
---
```

Body sections (consistent template):

1. **Overview** — scope, timeline, deliverables
2. **Status & notes** — current state, blockers
3. **Linked procedures** — auto-rendered from frontmatter `sops` / `workflows`
4. **Related writing** — links to blog posts
5. **Files & assets** — paths, drive links, session folders

#### Document flow (project-centric)

```
Client Intake (workflow)
    ↓
Active Project Hub  ←────────── Blog post (task reflection)
    ↓                              ↓
Session Prep → Recording → Mix → Delivery    informs wiki update
    ↓              ↓         ↓        ↓
  (each step links to relevant SOP)
    ↓
Archive (project moved, learnings captured)
```

---

### Silo 2 — Blog (`/blog`)

**Organized for quick reading and easy escape hatches to the wiki.**

#### Post types (by frontmatter `type`, optional)

| Type | Example | Typical length |
|---|---|---|
| `quick` | "Fixed a phase issue with this trick" | Short |
| `deep-dive` | "Building a Reaper macro for stem exports" | Long |
| `braindump` | Unstructured notes from a session | Variable |
| `project-log` | Progress update tied to a wiki project | Medium |

#### Post frontmatter

```yaml
---
title: "Fixing room modes on a budget"
description: "Brain dump from this week's studio session"
date: 2026-01-15
type: braindump
tags: [acoustics, diy, studio]
wiki_links:
  - /spawn/reference/room-treatment
  - /spawn/sops/quality-checklist
project: /spawn/projects/active/studio-upgrade
---
```

#### Blog-specific UI features

1. **Related Wiki panel** — rendered from `wiki_links` frontmatter; shows title + description of linked pages
2. **Pinned wiki shortcuts** — footer or sidebar on blog layout: Active Projects, Key SOPs, Workflows (hardcoded in layout config, easy to update)
3. **Tag pages** — auto-generated by `blogPlugin()` at `/blog/tags`
4. **RSS feed** — for public subscribers / portfolio indexing

#### Document flow (reflection-centric)

```
Small studio task
    → Quick blog post
        → links to SOP used
        → may trigger wiki update if process changed

Larger project (wiki hub exists)
    → Series of blog posts (project-log type)
        → consolidated into SOP/workflow when pattern stabilizes
```

---

### Silo 3 — Study (`/study`)

**Organized by module, with explicit bridges to practical audio work.**

#### Section tree

```
Study
├── Modules
│   ├── Acoustics
│   ├── DSP
│   ├── Music Production
│   └── Sound Design
├── Semesters             (2025-fall, 2026-spring — temporal grouping)
├── Reading               (bibliography, paper notes)
├── Exams                 (prep notes, past questions)
└── Practical Bridges     (theory → SPAWN wiki links)
```

#### Module page structure

Each module gets an index that lists lectures, assignments, and bridges:

```yaml
---
title: Acoustics
description: "Year 2 — room acoustics, wave behaviour, measurement"
semester: 2026-spring
tags: [acoustics, year-2]
---
```

#### Practical Bridges (`/study/practical-bridges/`)

Dedicated pages that connect academic content to SPAWN wiki:

```yaml
---
title: "Room Modes — Lab to Studio"
study_refs: [/study/modules/acoustics/lecture-02-room-modes]
wiki_refs: [/spawn/reference/room-treatment]
blog_refs: [/blog/2026/fixing-room-modes]
---
```

This folder is the primary cross-silo connector for Study ↔ Wiki ↔ Blog.

#### Document flow (module-centric)

```
Module Index
    → Lecture notes
        → Assignment
            → Practical Bridge (applies theory to studio)
                → SPAWN Wiki technique
                → Optional blog reflection
    → Exam prep (links back to lectures + bridges)
```

---

## 5. Cross-Silo Linking

### Mechanisms

| Mechanism | Where used | Implementation |
|---|---|---|
| MDX inline links | All silos | Standard `[text](/spawn/...)` |
| Frontmatter `wiki_links` | Blog posts | Custom blog layout component |
| Frontmatter `sops` / `workflows` | Project hubs | Custom MDX component listing linked pages |
| Frontmatter `study_refs` / `wiki_refs` | Practical bridges | Custom MDX component |
| Shared tags | All silos | FlexSearch tag filtering |
| Project hub pages | Wiki | Central node linking blog + SOPs |

### Search behaviour

- **Global search (⌘K):** searches all three silos
- **Tag scoping:** search index includes a `tag` field (first URL segment or explicit frontmatter tags) so results can be filtered by silo
- **Future:** scoped search when inside a silo (v1.1)

### Link validation

Enable link validation plugin in CI/build (v1.1) to catch broken cross-silo references.

---

## 6. Visual Identity & Layout

### Per-silo feel (same design system, different emphasis)

| Silo | Layout | Visual tone |
|---|---|---|
| Wiki | Docs layout (sidebar + TOC) | Clean, structured, neutral theme |
| Blog | HomeLayout (no sidebar) | Warmer typography, wider reading measure, author-forward |
| Study | Docs layout (sidebar + TOC) | Same as wiki; module icons for wayfinding |

### Theming

- Base theme: Fumadocs neutral/black preset
- Custom CSS variables in `src/app.css` for [SPAWN] brand accent
- Blog: slightly larger body font, relaxed line-height
- Shared navbar/footer across all silos for consistent wayfinding

### Icons

Lucide icons via frontmatter `icon` field on section index pages:

- Wiki root: `AudioLines` or `Mic`
- Blog: `PenLine`
- Study: `GraduationCap`

---

## 7. Configuration Shape

### `press.config.tsx` (conceptual)

```ts
import { defineConfig } from 'fumapress';
import { fumadocsMdx } from 'fumapress/adapters/mdx';
import { blogMetaSchema, blogPageSchema } from 'fumapress/adapters/mdx/schema';
import { blogPlugin } from 'fumapress/plugins/blog';
import { flexsearchPlugin } from 'fumapress/plugins/flexsearch';
import { llmsPlugin } from 'fumapress/plugins/llms.txt';
import { defineDocs } from 'fumadocs-mdx/macro';
import { createDocsLayoutPage } from 'fumapress/layouts/docs';
import { createBlogLayoutPage } from 'fumapress/layouts/blog';

const spawn = defineDocs({ dir: 'content/spawn', docs: { async: true } });
const study = defineDocs({ dir: 'content/study', docs: { async: true } });
const blog = defineDocs({
  dir: 'content/blog',
  docs: { async: true, schema: blogPageSchema, lastModified: true },
  meta: { schema: blogMetaSchema },
});

const DocsPage = createDocsLayoutPage<typeof config.$context>();
const BlogPage = createBlogLayoutPage<typeof config.$context>();

const config = defineConfig({
  site: {
    name: '[SPAWN] Audio',
    baseUrl: 'https://spawn.audio', // TBD
    git: { user: '...', repo: '...', branch: 'main' },
  },
  content: {
    spawn: spawn.toFumadocsSource({ baseDir: 'spawn' }),
    study: study.toFumadocsSource({ baseDir: 'study' }),
    blog: blog.toFumadocsSource({ baseDir: 'blog' }),
  },
  defaultLayoutProps: {
    nav: { title: '[SPAWN] Audio' },
    links: [
      { text: 'Wiki', url: '/spawn' },
      { text: 'Blog', url: '/blog' },
      { text: 'Study', url: '/study' },
    ],
  },
  renderPage: (props) => {
    if (props.page.type === 'blog') return <BlogPage {...props} />;
    return <DocsPage {...props} />;
  },
})
  .plugins(
    blogPlugin({ paths: { index: '/blog', tags: '/blog/tags' } }),
    flexsearchPlugin(),
    llmsPlugin(),
  )
  .adapters(fumadocsMdx());

export default config;
```

---

## 8. Content Authoring Conventions

### File naming

- Lowercase, hyphen-separated: `client-intake.mdx`, `lecture-02-room-modes.mdx`
- Blog posts: `YYYY/slug.mdx` or flat `slug.mdx` with `date` in frontmatter
- No spaces in filenames (Fumadocs URL convention)

### Frontmatter minimums

| Silo | Required fields |
|---|---|
| Wiki | `title`, `description` |
| Blog | `title`, `description`, `date`, `tags` |
| Study | `title`, `description` |
| Project hubs | above + `status`, `tags` |

### `meta.json` for sidebar order

Each folder with multiple pages gets a `meta.json`:

```json
{
  "title": "Workflows",
  "pages": ["client-intake", "session-prep", "recording", "editing-mixing", "delivery-handoff"]
}
```

Root-level `meta.json` per silo controls top-level section order.

### Writing workflow

1. Edit MDX locally in VS Code / Cursor
2. `npm run dev` to preview
3. Commit to Git
4. Push → auto-deploy via CI

No CMS, no WYSIWYG — intentional for a solo Git-native workflow.

---

## 9. Implementation Phases

### Phase 0 — Scaffold (day 1)

- [ ] `npm create fumapress` in repo root
- [ ] Configure three content collections + blog plugin
- [ ] Wire navbar links and `renderPage` layout switching
- [ ] Verify dev server at `localhost:3000`

### Phase 1 — IA skeleton (day 1–2)

- [ ] Create folder structure for all three silos
- [ ] Add `meta.json` files with section ordering
- [ ] Placeholder index page per silo (`root: true`)
- [ ] Placeholder pages for key sections (5–10 per silo)
- [ ] Hub landing page with silo cards

### Phase 2 — Theming (day 2)

- [ ] [SPAWN] brand colors/fonts in `src/app.css`
- [ ] Blog layout customization (typography, Related Wiki panel stub)
- [ ] Section icons on silo root pages

### Phase 3 — Cross-linking (day 2–3)

- [ ] `wiki_links` frontmatter → Related Wiki panel in blog layout
- [ ] Project hub template with linked SOPs/workflows component
- [ ] Practical Bridges template with study/wiki/blog refs
- [ ] Hub landing page: recent activity from loader API

### Phase 4 — Seed content (ongoing)

- [ ] Write 2–3 real wiki pages (one workflow, one SOP, one project hub)
- [ ] Write 1–2 real blog posts with wiki links
- [ ] Write 1 module index + 1 lecture note in Study
- [ ] Migrate any existing notes (manual or Obsidian script)

### Phase 5 — Deploy (day 3)

- [ ] Configure static build
- [ ] Connect Vercel (or Cloudflare Pages) to repo
- [ ] Set custom domain
- [ ] Verify sitemap, RSS, llms.txt, search

---

## 10. Open Decisions (minor — can resolve during implementation)

| Decision | Default if unresolved |
|---|---|
| Custom domain | `spawn-audio.vercel.app` until domain chosen |
| Blog URL date prefix | Flat slugs (`/blog/post-name`); date in frontmatter only |
| Year folders in blog | Optional; use if post count grows |
| Obsidian migration | Manual for v1; script if vault is large |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Cross-silo links break after restructure | Link validation in CI (v1.1); consistent slug conventions |
| Blog and wiki tone bleed together | Separate layouts and authoring templates per silo |
| Study section grows unwieldy | Semester folders + module index pages; archive old semesters |
| Fumapress is newer/less documented | Underlying Fumadocs API is stable; can migrate to full Fumadocs if needed |
| Content authoring friction (MDX) | Templates for project hubs, blog posts, lecture notes |

---

## Appendix A — Example `meta.json` (spawn root)

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

## Appendix B — Example blog post

```mdx
---
title: "First pass at the vocal chain for Client X"
description: "Quick notes from today's session — de-esser placement experiment"
date: 2026-02-14
type: project-log
tags: [mixing, vocals, client-x]
wiki_links:
  - /spawn/workflows/editing-mixing
  - /spawn/sops/quality-checklist
project: /spawn/projects/active/client-x-album
---

## What I tried

Started with the usual subtractive EQ before compression...

## What worked

Moving the de-esser post-compression instead of pre...

## Next session

- Try parallel compression on the chorus doubles
- Check against [quality checklist](/spawn/sops/quality-checklist)
```

## Appendix C — Example practical bridge

```mdx
---
title: "Room Modes — Lab to Studio"
description: "Connecting acoustics lecture material to the studio treatment plan"
study_refs:
  - /study/modules/acoustics/lecture-02-room-modes
wiki_refs:
  - /spawn/reference/room-treatment
blog_refs:
  - /blog/2026/fixing-room-modes
tags: [acoustics, studio, bridge]
---

## Theory (from lecture)

Standing waves form when...

## Applied (in the studio)

Measured my room and found peaks at 73 Hz and 146 Hz...

## Wiki procedures

See [Room Treatment Reference](/spawn/reference/room-treatment) for the full treatment plan.
```
