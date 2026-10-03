import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const THEMES = ["light", "dark"] as const;
/**
 * Stories that cannot produce a stable PNG, so they are never snapshotted:
 *  - the five NumberTicker stories run a motion/react spring count-up on mount that ignores
 *    `reducedMotion` (Storybook sanitizes the "Components/NumberTicker" title to
 *    `components-numberticker`);
 *  - Calendar/Default renders today's date;
 *  - Calendar/WithTimeKeyboard types into the time field from a play function, so the frame
 *    depends on how far the play has run;
 *  - Avatar/WithImage loads a remote image, so it depends on network timing.
 */
const EXCLUDED = new Set([
  "components-numberticker--default",
  "components-numberticker--with-decimals",
  "components-numberticker--count-down",
  "components-numberticker--large-number",
  "components-numberticker--percentage",
  "components-calendar--default",
  "components-calendar--with-time-keyboard",
  "components-avatar--with-image",
]);
// Read at load time so one test is generated per story × theme: workers apply, the per-test
// timeout is per story, and every drifted story is reported (not just the first).
const index = JSON.parse(
  readFileSync(
    new URL("../storybook-static/index.json", import.meta.url),
    "utf8",
  ),
) as {
  entries: Record<string, { id: string; type: string }>;
};
const ids = Object.values(index.entries)
  .filter((e) => e.type === "story" && !EXCLUDED.has(e.id))
  .map((e) => e.id)
  .sort();

test("the built index has stories and every excluded id exists", () => {
  expect(ids.length).toBeGreaterThan(60);
  for (const id of EXCLUDED)
    expect(index.entries, `excluded id ${id} must exist`).toHaveProperty(id);
});

test("the built index has the docs pages and one autodocs page per component", () => {
  const entries = Object.values(index.entries);
  const docs = new Set(
    entries.filter((e) => e.type === "docs").map((e) => e.id),
  );
  for (const page of [
    "introduction",
    "installation",
    "styling-and-tokens",
    "accessibility",
  ])
    expect(docs, page).toContain(`docs-${page}--docs`);
  const components = new Set(
    entries.filter((e) => e.type === "story").map((e) => e.id.split("--")[0]),
  );
  for (const component of components)
    expect(docs, component).toContain(`${component}--docs`);
});

for (const id of ids) {
  for (const theme of THEMES) {
    test(`${id} [${theme}]`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${id}&viewMode=story`);
      await page.waitForSelector("#storybook-root:not(:empty)");
      await page.evaluate((t) => {
        if (t === "dark") document.documentElement.dataset.theme = "dark";
        else delete document.documentElement.dataset.theme;
      }, theme);
      await page.waitForTimeout(150);
      await expect(page).toHaveScreenshot(`${id}-${theme}.png`, {
        fullPage: true,
      });
    });
  }
}
