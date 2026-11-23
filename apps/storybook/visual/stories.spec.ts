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
 *  - Avatar/WithImage loads a remote image, so it depends on network timing;
 *  - the five SpinningText stories rotate forever on a motion/react loop, so no two frames
 *    match.
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
  "components-spinningtext--default",
  "components-spinningtext--reverse",
  "components-spinningtext--slow",
  "components-spinningtext--large-radius",
  "components-spinningtext--styled",
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

/**
 * Every story above is captured in the neutral theme. The themes in @tilli.dev/themes are
 * captured on a subset: enough to catch a component that breaks on tinted surfaces or a
 * blue focus ring, without tripling the job. The tilli and nudge themes are palettes of
 * their own and share one list. Beacon is the tilli theme plus the spectrum, so it only needs the stories
 * that show the spectrum or the sidebar it is meant for.
 */
const PALETTE_STORIES = [
  "components-alert--all-variants",
  "components-alert--with-action",
  "components-badge--all-variants",
  "components-badge--sizes",
  "components-button--all-variants",
  "components-button--disabled-variants",
  "components-button--loading",
  "components-card--default",
  "components-card--long-content",
  "components-card--with-form",
  "components-checkbox--indeterminate",
  "components-checkbox--with-description",
  "components-field--with-error",
  "components-input--all-variants",
  "components-input--with-icons",
  "components-input--with-label",
  "components-inputgroup--with-button",
  "components-progress--values",
  "components-radiogroup--default",
  "components-select--sizes",
  "components-sidebar--default",
  "components-sidebar--with-active-item",
  "components-switch--with-label",
  "components-table--default",
  "components-table--with-selection",
  "components-tabs--default",
  "components-tabs--underline",
  "components-textarea--sizes",
  "components-toast--variants",
] as const;
const THEMED: Record<string, readonly string[]> = {
  tilli: PALETTE_STORIES,
  nudge: PALETTE_STORIES,
  beacon: [
    "components-sidebar--with-active-item",
    "components-spectrum--light-and-dark",
  ],
};

test("the built index has stories and every excluded or themed id exists", () => {
  expect(ids.length).toBeGreaterThan(60);
  for (const id of EXCLUDED)
    expect(index.entries, `excluded id ${id} must exist`).toHaveProperty(id);
  for (const [palette, themed] of Object.entries(THEMED))
    for (const id of themed) {
      expect(index.entries, `${palette} id ${id} must exist`).toHaveProperty(
        id,
      );
      expect(EXCLUDED.has(id), `${palette} id ${id} is excluded`).toBe(false);
    }
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

for (const [palette, themed] of Object.entries(THEMED)) {
  for (const id of themed) {
    for (const theme of THEMES) {
      test(`${id} [${palette} ${theme}]`, async ({ page }) => {
        await page.goto(
          `/iframe.html?id=${id}&viewMode=story&globals=palette:${palette}`,
        );
        await page.waitForSelector("#storybook-root:not(:empty)");
        // The toolbar global adds the theme's stylesheet after the neutral one.
        await page.waitForSelector(`style[data-palette="${palette}"]`, {
          state: "attached",
        });
        await page.evaluate((t) => {
          if (t === "dark") document.documentElement.dataset.theme = "dark";
          else delete document.documentElement.dataset.theme;
        }, theme);
        await page.waitForTimeout(150);
        await expect(page).toHaveScreenshot(`${id}-${palette}-${theme}.png`, {
          fullPage: true,
        });
      });
    }
  }
}
