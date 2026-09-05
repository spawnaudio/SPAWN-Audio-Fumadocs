# [SPAWN] Audio Docs

Public personal knowledge site for [SPAWN] audio work — built with [Fumapress](https://press.fumadocs.dev).

## Silos

| Path | Purpose |
| --- | --- |
| `/spawn` | Wiki — workflows, SOPs, project hubs, business & reference |
| `/blog` | Personal writing — session notes, experiments, deeper prose |
| `/study` | University modules, exams, and practical bridges into the studio |
| `/` | Hub landing page linking the three silos |

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

The site is configured with `mode: "static"` for CDN-friendly deploys (Vercel, Cloudflare Pages, etc.).

## Content

Author MDX under `content/`:

```
content/
  spawn/    # wiki
  blog/     # posts (tags + wiki_links frontmatter supported)
  study/    # coursework
```

Sidebar order is controlled with `meta.json` files (`pages` arrays).

## Stack

- Fumapress 1.x (Waku + Vite)
- Fumadocs MDX content collections
- Tailwind CSS v4
