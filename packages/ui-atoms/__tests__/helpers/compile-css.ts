import { join } from "node:path";
import { compile } from "@tailwindcss/node";

const BASE = join(import.meta.dirname, "..", "..", "src");

/**
 * Compiles a stylesheet the way a consumer's Tailwind build would, resolving `@import`s
 * from `packages/ui-atoms/src`. `candidates` are the class names "found in markup".
 */
export async function compileCss(
  css: string,
  candidates: string[] = [],
): Promise<string> {
  const compiler = await compile(css, {
    base: BASE,
    onDependency: () => undefined,
  });
  return compiler.build(candidates);
}

function normalise(selector: string): string {
  return selector
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .trim();
}

/**
 * The custom properties declared under rules whose selector is exactly `selector`
 * (whitespace-insensitive), at any nesting depth. Later rules win, as in the cascade.
 */
export function declarationsFor(
  output: string,
  selector: string,
): Record<string, string> {
  const wanted = normalise(selector);
  const found: Record<string, string> = {};
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of output.matchAll(rule)) {
    const [, rawSelector = "", body = ""] = match;
    if (normalise(rawSelector) !== wanted) continue;
    for (const declaration of body.split(";")) {
      const colon = declaration.indexOf(":");
      if (colon === -1) continue;
      const name = declaration.slice(0, colon).trim();
      if (name.startsWith("--"))
        found[name] = declaration.slice(colon + 1).trim();
    }
  }
  return found;
}
