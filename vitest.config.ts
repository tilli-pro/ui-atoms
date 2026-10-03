import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["__tests__/**/*.test.ts"],
    environment: "node",
    // same reason as the package config: `pr-tests` passes `--changed`.
    passWithNoTests: true,
  },
});
