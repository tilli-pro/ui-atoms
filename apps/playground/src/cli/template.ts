import { compareStrings } from "../recipes-manifest.js";
import { componentNameFromSlug } from "./slug.js";

/**
 * Source for a new `src/recipes/<slug>.tsx`: one deliberately empty named
 * import per selected ui-atoms subpath, for the author to fill in, and the
 * default-exported component the recipe route renders.
 */
export function renderRecipeModule(
  slug: string,
  components: readonly string[],
): string {
  const imports = [...new Set(components)]
    .sort(compareStrings)
    .map((c) => `import {} from "@tilli.dev/ui-atoms/${c}";\n`)
    .join("");
  return `${imports}${imports ? "\n" : ""}export default function ${componentNameFromSlug(slug)}() {
  return (
    <main className="flex flex-col gap-4 p-8">
      {/* TODO: compose this recipe from the imported ui-atoms components. */}
    </main>
  );
}
`;
}
