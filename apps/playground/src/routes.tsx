import type { RouteObject } from "react-router";
import {
  type RecipeLoader,
  type RecipeModule,
  recipeLoaders,
  recipes,
} from "./catalog.js";
import { LoadingPage } from "./pages/loading-page.js";
import { NotFoundPage } from "./pages/not-found-page.js";
import { RecipeListPage } from "./pages/recipe-list-page.js";
import { RootLayout } from "./pages/root-layout.js";
import { RouteErrorPage } from "./pages/route-error-page.js";
import type { Recipe } from "./recipes-manifest.js";

export function recipePath(slug: string): string {
  return `/recipes/${slug}`;
}

function assertRecipeModule(
  mod: Partial<RecipeModule>,
  slug: string,
): asserts mod is RecipeModule {
  const component: unknown = mod.default;
  const renderable =
    typeof component === "function" ||
    (typeof component === "object" && component !== null);
  if (!renderable)
    throw new Error(
      `src/recipes/${slug}.tsx must default-export the React component the recipe route renders.`,
    );
}

function recipeRoute(recipe: Recipe, load: RecipeLoader): RouteObject {
  return {
    path: recipePath(recipe.slug).slice(1),
    HydrateFallback: LoadingPage,
    lazy: async () => {
      const mod = await load();
      assertRecipeModule(mod, recipe.slug);
      const RecipeComponent = mod.default;
      return {
        Component: () => (
          <>
            <title>{`${recipe.title} · ui-atoms recipes`}</title>
            <RecipeComponent />
          </>
        ),
      };
    },
  };
}

/**
 * `/` lists the recipes, `/recipes/<slug>` renders that recipe's default
 * export, anything else is a 404. One static route per recipes.json entry
 * that has a module, so an unknown slug never matches a recipe route.
 */
export function buildRoutes(
  manifest: readonly Recipe[],
  loaders: Readonly<Record<string, RecipeLoader>>,
): RouteObject[] {
  const recipeRoutes = manifest.flatMap((recipe) => {
    const load = loaders[recipe.slug];
    return load ? [recipeRoute(recipe, load)] : [];
  });
  return [
    {
      path: "/",
      Component: RootLayout,
      ErrorBoundary: RouteErrorPage,
      HydrateFallback: LoadingPage,
      children: [
        { index: true, element: <RecipeListPage recipes={manifest} /> },
        ...recipeRoutes,
        { path: "*", Component: NotFoundPage },
      ],
    },
  ];
}

export const routes = buildRoutes(recipes, recipeLoaders);
