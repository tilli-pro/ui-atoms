import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * The GitHub Pages root app. `BASE_PATH` is the path the site is served
 * under (`/ui-atoms/` on Pages, set by .github/workflows/pages.yml); the
 * Storybook and the playground are deployed beside it at `storybook/` and
 * `playground/`.
 */
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
});
