/// <reference types="vitest/config" />
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import {
  diffRecipeModules,
  parseManifest,
  slugFromModulePath,
} from "./src/recipes-manifest.js";

/**
 * Fails `vite build` when recipes.json and src/recipes/*.tsx disagree, so a
 * recipe can neither ship without its module nor exist without an entry.
 * (Default exports are checked by __tests__/catalog.test.ts.)
 */
function recipeParity(): Plugin {
  return {
    name: "playground:recipe-parity",
    apply: "build",
    buildStart() {
      const root = import.meta.dirname;
      const manifest = parseManifest(
        JSON.parse(readFileSync(join(root, "recipes.json"), "utf8")),
      );
      const modules = readdirSync(join(root, "src", "recipes"))
        .map(slugFromModulePath)
        .filter((slug) => slug !== undefined);
      const { missingModules, missingEntries } = diffRecipeModules(
        manifest.map((r) => r.slug),
        modules,
      );
      const problems = [
        ...missingModules.map(
          (s) =>
            `recipes.json lists "${s}" but src/recipes/${s}.tsx is missing`,
        ),
        ...missingEntries.map(
          (s) => `src/recipes/${s}.tsx has no recipes.json entry`,
        ),
      ];
      if (problems.length > 0) this.error(problems.join("\n"));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), recipeParity()],
  test: {
    environment: "jsdom",
    setupFiles: ["./__tests__/helpers/setup-tests.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
});
