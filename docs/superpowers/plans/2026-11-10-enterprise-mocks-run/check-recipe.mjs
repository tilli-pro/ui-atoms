// Headless walkthrough of the enterprise-ui-ux recipe. Usage:
//   node check-recipe.mjs <baseUrl> <personas,comma> <routes,comma> [--interact]
// Prints one JSON line per persona×route and a final summary line.
import { createRequire } from "node:module";

const require = createRequire(
  "/Users/g1n/tilli/ui-atoms/apps/storybook/package.json",
);
const { chromium } = require("playwright");

const [baseUrl, personasArg, routesArg, ...flags] = process.argv.slice(2);
const personas = (personasArg ?? "utilities").split(",");
const routes = (routesArg ?? "").split(",").filter(Boolean);
const interact = flags.includes("--interact");

const browser = await chromium.launch();
const summary = {
  pages: 0,
  consoleErrors: 0,
  pageErrors: 0,
  mockToCome: 0,
  overflowX: 0,
  failures: [],
};

for (const persona of personas) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript((p) => {
    window.localStorage.setItem(
      "control:persona",
      JSON.stringify({ type: "select", value: p }),
    );
  }, persona);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (e) =>
    errors.push(`pageerror: ${String(e).slice(0, 200)}`),
  );

  for (const route of routes) {
    errors.length = 0;
    const url = `${baseUrl}/recipes/enterprise-ui-ux${route}`;
    const out = { persona, route };
    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForFunction(
        () =>
          (document.querySelector("main")?.textContent.trim().length ?? 0) > 0,
        null,
        { timeout: 10000 },
      );
      await page.waitForTimeout(300);
      if (route === routes[0]) {
        // The control panel opens with Cmd/Ctrl+K; record whether the persona select is listed.
        await page.keyboard.press("Meta+k");
        await page.waitForTimeout(300);
        out.personaControl = await page.evaluate((p) => {
          const text = document.body.innerText;
          return {
            listed: /persona/i.test(text),
            showsValue: text.includes(p),
          };
        }, persona);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(200);
      }
      const read = async () =>
        page.evaluate(() => {
          const main = document.querySelector("main");
          const text = (sel) =>
            Array.from(main.querySelectorAll(sel)).map((e) =>
              e.textContent.trim(),
            );
          return {
            h1: main.querySelector("h1")?.textContent.trim() ?? null,
            eyebrow: main.querySelector("header p")?.textContent.trim() ?? null,
            mockToCome: main.textContent.includes("Mock to come"),
            overflowX:
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
            rows: main.querySelectorAll("tbody tr").length,
            headers: text("thead th").slice(0, 14),
            chips: text("button[aria-pressed]").slice(0, 20),
            selects: main.querySelectorAll('[role="combobox"]').length,
            segments: text(
              '[role="radiogroup"] [role="radio"], [data-slot="segmented-control"] button',
            ).slice(0, 10),
            footer:
              Array.from(main.querySelectorAll("*"))
                .map((e) => e.childNodes.length === 1 && e.textContent)
                .find(
                  (t) => typeof t === "string" && t.startsWith("Showing "),
                ) ?? null,
            needsReview: text("*").filter((t) => t === "Needs review").length,
            statCards: main.querySelectorAll("[aria-label='Key figures'] > *")
              .length,
            panels: main.querySelectorAll("[aria-label='Panels'] > *").length,
            empty:
              main.textContent.includes("No ") &&
              main.querySelectorAll("tbody tr").length === 0,
          };
        });
      Object.assign(out, await read());
      if (interact && out.rows > 0) {
        const chips = page.locator("main button[aria-pressed]");
        if ((await chips.count()) > 1) {
          await chips.nth(1).click();
          await page.waitForTimeout(200);
          const c = await read();
          out.afterChip = { rows: c.rows, footer: c.footer };
          await chips.nth(0).click();
        }
        const search = page.locator("main input[placeholder='Search']");
        if (await search.count()) {
          await search.fill("zzzz-no-match");
          await page.waitForTimeout(200);
          const r = await read();
          out.afterNoMatch = {
            rows: r.rows,
            footer: r.footer,
            emptyShown: r.rows === 0 && !!main_has_empty(r),
          };
          await search.fill("");
        }
        // Every segment: click it, read, run a no-match search, record rows/footer/errors per segment.
        const segs = page.locator(
          "main [role='radiogroup'] [role='radio'], main [data-slot='segmented-control'] button",
        );
        const segCount = await segs.count();
        if (segCount > 1) {
          out.segments2 = [];
          for (let s = 1; s < segCount; s += 1) {
            const before = errors.length;
            await segs.nth(s).click();
            await page.waitForTimeout(200);
            const r1 = await read();
            const sInput = page.locator("main input[placeholder='Search']");
            let r2 = null;
            if (await sInput.count()) {
              await sInput.fill("zzzz-no-match");
              await page.waitForTimeout(200);
              r2 = await read();
              await sInput.fill("");
            }
            // Exercise the first select in this segment: open it and pick its second option.
            let selectRows = null;
            const combo = page.locator("main [role='combobox']").first();
            if (await combo.count()) {
              await combo.click();
              await page.waitForTimeout(200);
              const opts = page.locator("[role='option']");
              if ((await opts.count()) > 1) {
                await opts.nth(1).click();
                await page.waitForTimeout(200);
                selectRows = (await read()).rows;
                await combo.click();
                await page.waitForTimeout(150);
                await page.locator("[role='option']").first().click();
                await page.waitForTimeout(150);
              } else {
                await page.keyboard.press("Escape");
              }
            }
            out.segments2.push({
              label: r1.segments[s],
              rows: r1.rows,
              headers: r1.headers,
              chips: r1.chips,
              footer: r1.footer,
              noMatchRows: r2?.rows,
              noMatchFooter: r2?.footer,
              selectRows,
              newErrors: errors.slice(before).map((e) => e.slice(0, 120)),
            });
          }
          await segs.nth(0).click();
          await page.waitForTimeout(200);
        }
        const next = page.locator(
          "main a[aria-label='Go to next page'], main button[aria-label='Go to next page'], main [data-slot='pagination-next'] button",
        );
        if (await next.count()) {
          const disabled = await next
            .first()
            .isDisabled()
            .catch(() => false);
          if (!disabled) {
            await next.first().click();
            await page.waitForTimeout(200);
            out.afterNext = (await read()).footer;
          }
        }
      }
      out.errors = errors.slice(0, 5);
      summary.pages += 1;
      summary.consoleErrors += errors.filter((e) =>
        e.startsWith("console"),
      ).length;
      summary.pageErrors += errors.filter((e) =>
        e.startsWith("pageerror"),
      ).length;
      if (out.mockToCome) summary.mockToCome += 1;
      if (out.overflowX) summary.overflowX += 1;
    } catch (e) {
      out.failure = String(e).slice(0, 300);
      summary.failures.push(`${persona} ${route}: ${out.failure}`);
    }
    console.log(JSON.stringify(out));
  }
  await context.close();
}
await browser.close();
console.log(`SUMMARY ${JSON.stringify(summary)}`);

function main_has_empty(r) {
  return r.footer?.startsWith("Showing 0") || r.empty;
}
