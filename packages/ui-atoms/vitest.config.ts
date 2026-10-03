import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    css: false,
    // `pr-tests` runs vitest with `--changed`, which can select zero tests
    // in this package; that is a pass, not a failure.
    passWithNoTests: true,
  },
});
