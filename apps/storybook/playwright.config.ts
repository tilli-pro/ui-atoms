import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  timeout: 30_000,
  workers: 4,
  fullyParallel: true,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      animations: "disabled",
      caret: "hide",
    },
  },
  use: {
    baseURL: "http://127.0.0.1:6007",
    browserName: "chromium",
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    // `@playwright/test` 1.58.2 moved `reducedMotion` off the top-level `use` options and onto
    // `contextOptions` (`BrowserContextOptions`); a flat `use.reducedMotion` does not typecheck
    // against this repo's pinned catalog version. `contextOptions` is where the installed
    // `playwright/test` type declares it (`testOptions.contextOptions`, `types/test.d.ts`).
    contextOptions: { reducedMotion: "reduce" },
  },
  webServer: {
    command: "pnpm serve",
    url: "http://127.0.0.1:6007/index.json",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
