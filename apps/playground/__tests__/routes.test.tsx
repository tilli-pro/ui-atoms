import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { buildRoutes, routes } from "../src/routes.js";
import { makeRecipe } from "./helpers/recipes.js";
import type { RecipeLoader } from "../src/catalog.js";

function renderAt(path: string, routeList = routes) {
  const router = createMemoryRouter(routeList, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const many = Array.from({ length: 20 }, (_, i) =>
  makeRecipe(`recipe-${String(i + 1).padStart(2, "0")}`, {
    description: `Description ${i + 1}`,
    version: "1.2.3",
    changelog: [{ version: "1.2.3", date: "2026-01-01", changes: "x" }],
  }),
);

const stubLoader =
  (text: string): RecipeLoader =>
  () =>
    Promise.resolve({ default: () => <p>{text}</p> });

describe("recipe list (/)", () => {
  it("shows a card per recipe linking to its route", async () => {
    renderAt("/");
    const link = await screen.findByRole("link", { name: /Enterprise UI\/UX/ });
    expect(link).toHaveAttribute("href", "/recipes/enterprise-ui-ux");
    expect(link).toHaveAttribute("data-slot", "card");
    expect(within(link).getByText("v1.2.0")).toHaveAttribute(
      "data-slot",
      "badge",
    );
    expect(within(link).getByText(/icon rail/)).toHaveAttribute(
      "data-slot",
      "card-description",
    );
    expect(screen.queryByRole("navigation", { name: "pagination" })).toBe(null);
  });

  it("paginates at 16 cards per page through ?page=", async () => {
    const list = buildRoutes(many, {});
    renderAt("/", list);
    expect(await screen.findAllByRole("listitem")).toHaveLength(16 + 4);
    const cards = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("data-slot") === "card");
    expect(cards).toHaveLength(16);
    expect(cards[0]).toHaveAttribute("href", "/recipes/recipe-01");
    const nav = screen.getByRole("navigation", { name: "pagination" });
    expect(within(nav).getByRole("link", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Go to next page" }),
    ).toHaveAttribute("href", "/?page=2");
  });

  it("shows the second page and clamps out-of-range pages", async () => {
    const list = buildRoutes(many, {});
    renderAt("/?page=2", list);
    await screen.findByText(/page 2 of 2/);
    const cards = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("data-slot") === "card");
    expect(cards.map((c) => c.getAttribute("href"))).toEqual([
      "/recipes/recipe-17",
      "/recipes/recipe-18",
      "/recipes/recipe-19",
      "/recipes/recipe-20",
    ]);
  });

  it("clamps a page past the end to the last page", async () => {
    renderAt("/?page=9", buildRoutes(many, {}));
    expect(await screen.findByText(/page 2 of 2/)).toBeInTheDocument();
  });
});

describe("recipe routes (/recipes/<slug>)", () => {
  it("renders the module's default export", async () => {
    const load = vi.fn(stubLoader("hello from a"));
    renderAt("/recipes/a", buildRoutes([makeRecipe("a")], { a: load }));
    expect(await screen.findByText("hello from a")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("builds one route per manifest entry that has a module", async () => {
    renderAt(
      "/recipes/b",
      buildRoutes([makeRecipe("a")], { b: stubLoader("b") }),
    );
    expect(await screen.findByText("Page not found")).toBeInTheDocument();
  });

  it("shows an error when a module has no default export", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const load = (() => Promise.resolve({})) as unknown as RecipeLoader;
    renderAt("/recipes/a", buildRoutes([makeRecipe("a")], { a: load }));
    expect(
      await screen.findByText(
        /src\/recipes\/a.tsx \(or a\/index.tsx\) must default-export/,
      ),
    ).toBeInTheDocument();
    spy.mockRestore();
  });
});

describe("404", () => {
  it.each(["/nope", "/recipes/does-not-exist", "/recipes"])(
    "%s is not found",
    async (path) => {
      renderAt(path);
      expect(await screen.findByText("Page not found")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "All recipes" })).toHaveAttribute(
        "href",
        "/",
      );
    },
  );
});
