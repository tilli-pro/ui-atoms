// Headless walkthrough of the enterprise-ui-ux recipe. Usage:
//   node check-recipe.mjs <baseUrl> <personas,comma> <routes,comma> [--interact] [--details]
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
const details = flags.includes("--details");
const detailLists = ["#/network/contacts", "#/network/organizations"];
const LIST_HASH = /^#\/network\//;

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
  if (details) {
    for (const list of detailLists) {
      errors.length = 0;
      const out = { persona, route: list };
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`${baseUrl}/recipes/enterprise-ui-ux${list}`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector("main tbody tr:first-child", {
          timeout: 10000,
        });
        await page
          .locator("main tbody tr:first-child button:not([role='checkbox'])")
          .first()
          .click();
        await page.waitForFunction(
          () => /^#\/network\/[^/]+\/.+/.test(window.location.hash),
          null,
          { timeout: 10000 },
        );
        await page.waitForSelector("main [role='tab']", { timeout: 10000 });
        await page.waitForSelector("main h1", { timeout: 10000 });
        await page.waitForTimeout(300);
        const hash = await page.evaluate(() => window.location.hash);
        out.route = hash.replace(LIST_HASH, "");
        const readDetail = () =>
          page.evaluate(() => {
            const main = document.querySelector("main");
            const text = (sel) =>
              Array.from(main.querySelectorAll(sel)).map((e) =>
                e.textContent.trim(),
              );
            return {
              h1: main.querySelector("h1")?.textContent.trim() ?? null,
              crumbs: text("nav li").filter(Boolean),
              badges: main.querySelectorAll("h1 [data-slot='badge']").length,
              summaryCells: main.querySelector("dl")?.children.length ?? 0,
              cards: main.querySelectorAll("[data-slot='card']").length,
              tabs: text("[role='tab']"),
            };
          });
        const overflow = () =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
          );
        Object.assign(out, await readDetail());
        if (!out.route.includes("/") || out.tabs.length === 0) {
          summary.failures.push(`${persona} ${out.route}: profile not reached`);
        }
        const tabLocator = page.locator("main [role='tab']");
        const tabCount = await tabLocator.count();
        out.tabErrors = [];
        for (let i = 0; i < tabCount; i += 1) {
          const before = errors.length;
          await tabLocator.nth(i).click();
          await page.waitForTimeout(200);
          out.tabErrors.push(errors.slice(before).map((e) => e.slice(0, 120)));
        }
        if (tabCount > 0) {
          await tabLocator.nth(0).click();
          await page.waitForTimeout(200);
        }
        out.overflowX = await overflow();
        await page.setViewportSize({ width: 1024, height: 800 });
        await page.waitForTimeout(200);
        out.overflowAt1024 = await overflow();
        await page.setViewportSize({ width: 1440, height: 900 });
        // Same profile on a fresh context with the inset sidebar preset.
        const insetContext = await browser.newContext({
          viewport: { width: 1024, height: 800 },
        });
        await insetContext.addInitScript((p) => {
          window.localStorage.setItem(
            "control:persona",
            JSON.stringify({ type: "select", value: p }),
          );
          window.localStorage.setItem(
            "control:inset",
            JSON.stringify({ type: "switch", value: true }),
          );
        }, persona);
        const insetPage = await insetContext.newPage();
        const insetErrors = [];
        insetPage.on("console", (m) => {
          if (m.type() === "error")
            insetErrors.push(`console: ${m.text().slice(0, 200)}`);
        });
        insetPage.on("pageerror", (e) =>
          insetErrors.push(`pageerror: ${String(e).slice(0, 200)}`),
        );
        await insetPage.goto(`${baseUrl}/recipes/enterprise-ui-ux${hash}`, {
          waitUntil: "networkidle",
        });
        await insetPage.waitForSelector("main h1", { timeout: 10000 });
        await insetPage.waitForTimeout(300);
        out.overflowInset = await insetPage.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        );
        await insetContext.close();
        errors.push(...insetErrors);
        out.errors = errors.slice(0, 5);
        summary.pages += 1;
        summary.consoleErrors += errors.filter((e) =>
          e.startsWith("console"),
        ).length;
        summary.pageErrors += errors.filter((e) =>
          e.startsWith("pageerror"),
        ).length;
        for (const flag of [
          out.overflowX,
          out.overflowAt1024,
          out.overflowInset,
        ]) {
          if (flag) summary.overflowX += 1;
        }
      } catch (e) {
        out.failure = String(e).slice(0, 300);
        summary.failures.push(`${persona} ${list} details: ${out.failure}`);
      }
      console.log(JSON.stringify(out));
    }
  }
  await context.close();
}
await browser.close();
console.log(`SUMMARY ${JSON.stringify(summary)}`);

function main_has_empty(r) {
  return r.footer?.startsWith("Showing 0") || r.empty;
}
