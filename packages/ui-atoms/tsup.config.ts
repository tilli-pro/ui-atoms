import { defineConfig } from "tsup";

// Unbundled: one output file per source file, so each file's own `"use client"`
// directive is preserved by esbuild's transform and nothing is hoisted into shared
// chunks (the classic "directive lost in chunk" failure of bundled RSC libraries).
// Declarations come from `tsc -p tsconfig.build.json` (same file layout).
// `src/` holds shipped code only — every test lives in `packages/ui-atoms/__tests__/` —
// so the entry globs need no test/helper exclusions.
export default defineConfig({
  entry: ["src/**/*.ts", "src/**/*.tsx"],
  format: ["esm"],
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  target: "es2022",
  outDir: "dist",
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
