import { join } from "node:path";
import { compile, optimize } from "@tailwindcss/node";

const BASE = join(import.meta.dirname, "..", "..", "src");

/**
 * Compiles a stylesheet the way a consumer's Tailwind build would, resolving `@import`s
 * from `packages/ui-atoms/src`. `candidates` are the class names "found in markup".
 * `optimize` also runs Tailwind's production pass (Lightning CSS, minified).
 */
export async function compileCss(
  css: string,
  candidates: string[] = [],
  options: { optimize?: boolean } = {},
): Promise<string> {
  const compiler = await compile(css, {
    base: BASE,
    onDependency: () => undefined,
  });
  const built = compiler.build(candidates);
  return options.optimize ? optimize(built, { minify: true }).code : built;
}

function normalise(selector: string): string {
  return selector
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .trim();
}

/**
 * Custom properties declared directly in `body`, plus those inside `@supports` blocks
 * nested in it (Tailwind wraps each `color-mix()` value in one, after a plain fallback).
 * Later declarations win, as in the cascade.
 */
function collect(body: string, into: Record<string, string>): void {
  let depth = 0;
  let start = 0;
  let prelude = "";
  let own = "";
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === "{") {
      if (depth === 0) {
        const cut = Math.max(body.lastIndexOf(";", i), start - 1) + 1;
        own += body.slice(start, cut);
        prelude = body.slice(cut, i);
        start = i + 1;
      }
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        flush(own, into);
        own = "";
        if (prelude.trim().startsWith("@supports"))
          collect(body.slice(start, i), into);
        start = i + 1;
      }
    }
  }
  flush(own + body.slice(start), into);
}

function flush(declarations: string, into: Record<string, string>): void {
  for (const declaration of declarations.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon === -1) continue;
    const name = declaration.slice(0, colon).trim();
    if (name.startsWith("--"))
      into[name] = normalise(declaration.slice(colon + 1));
  }
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
  const opens: { selector: string; at: number }[] = [];
  let last = 0;
  for (let i = 0; i < output.length; i++) {
    const char = output[i];
    if (char === "{") {
      opens.push({ selector: normalise(output.slice(last, i)), at: i + 1 });
      last = i + 1;
    } else if (char === "}") {
      const open = opens.pop();
      if (open?.selector === wanted) collect(output.slice(open.at, i), found);
      last = i + 1;
    } else if (char === ";") {
      last = i + 1;
    }
  }
  return found;
}
