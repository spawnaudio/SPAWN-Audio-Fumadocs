import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import press from "fumapress/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";

export default defineConfig({
  plugins: [press(), fumadocsMdx(), tailwindcss()],
  optimizeDeps: {
    // Pre-bundle deps that fumapress pulls in only on the blog routes.
    // Without this they are discovered lazily on first /blog visit, which
    // triggers a mid-session Vite re-optimization that breaks the page.
    include: ["@fuma-translate/react"],
  },
});
