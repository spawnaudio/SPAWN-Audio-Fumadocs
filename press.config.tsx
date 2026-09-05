import { defineConfig } from "fumapress";
import { fumadocsMdx } from "fumapress/adapters/mdx";
import {
  blogMetaSchema,
  blogPageSchema,
  metaSchema,
  pageSchema,
} from "fumapress/adapters/mdx/schema";
import { createDocsLayoutPage } from "fumapress/layouts/docs";
import { createHomeLayout } from "fumapress/layouts/home";
import { createBlogLayoutPage } from "fumapress/layouts/blog";
import { blogPlugin } from "fumapress/plugins/blog";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";
import { RelatedWiki } from "./src/components/related-wiki";

const spawn = defineDocs({
  dir: "content/spawn",
  docs: {
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const study = defineDocs({
  dir: "content/study",
  docs: {
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const blog = defineDocs({
  dir: "content/blog",
  docs: {
    async: true,
    schema: blogPageSchema.extend({
      date: z.union([z.string(), z.date()]).optional(),
      type: z.string().optional(),
      project: z.string().optional(),
      wiki_links: z.array(z.string()).optional(),
    }),
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
const BlogPage = createBlogLayoutPage<typeof config.$context>({
  async render(page) {
    const body = await this.getPageBody(page);
    const data = page.data as { wiki_links?: string[] };

    return {
      body: (
        <>
          {body?.node}
          <RelatedWiki links={data.wiki_links ?? []} />
        </>
      ),
    };
  },
});

const config = defineConfig({
  mode: "static",
  content: {
    spawn: spawn.toFumadocsSource({
      baseDir: "spawn",
    }),
    study: study.toFumadocsSource({
      baseDir: "study",
    }),
    blog: blog.toFumadocsSource({
      baseDir: "blog",
    }),
  },
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
  renderPage: (props) => {
    if (props.page.type === "blog") {
      return <BlogPage {...props} />;
    }

    return <DocsPage {...props} />;
  },
  meta: {
    root() {
      return (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
            rel="stylesheet"
          />
        </>
      );
    },
  },
})
  .plugins(
    blogPlugin({
      paths: {
        index: "/blog",
        tags: "/blog/tags",
      },
      layouts: {
        layout: (props) => (
          <div className="editorial-surface" data-blog-page="">
            <HomeLayout {...props} />
          </div>
        ),
      },
    }),
  )
  .adapters(fumadocsMdx());

export const HomeLayout = createHomeLayout<typeof config.$context>();
export const { getPressContext } = config.utils();
export default config;
