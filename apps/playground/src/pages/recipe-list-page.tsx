import { Badge } from "@tilli.dev/ui-atoms/badge";
import { buttonVariants } from "@tilli.dev/ui-atoms/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@tilli.dev/ui-atoms/pagination";
import { Link, useSearchParams } from "react-router";
import { pageLinks, paginate, parsePage } from "../pagination.js";
import type { Recipe } from "../recipes-manifest.js";

function pageSearch(page: number): string {
  return page === 1 ? "" : `?page=${page}`;
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card
      className="h-full transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
      render={<Link to={`/recipes/${recipe.slug}`} />}
    >
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {recipe.description || "No description yet."}
        </CardDescription>
        <CardAction>
          <Badge variant="outline">v{recipe.version}</Badge>
        </CardAction>
      </CardHeader>
      {recipe.components.length > 0 && (
        <CardFooter className="mt-auto pt-0 text-muted-foreground text-xs">
          {recipe.components.join(" · ")}
        </CardFooter>
      )}
    </Card>
  );
}

function RecipePagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const stepClass = buttonVariants({ size: "default", variant: "ghost" });
  const disabledClass = "pointer-events-none opacity-64";
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious
              className={stepClass}
              render={<Link to={{ search: pageSearch(page - 1) }} />}
            />
          ) : (
            <PaginationPrevious
              aria-disabled={true}
              className={disabledClass}
            />
          )}
        </PaginationItem>
        {pageLinks(page, pageCount).map((link) => (
          <PaginationItem key={link}>
            {typeof link === "number" ? (
              <PaginationLink
                aria-label={`Page ${link}`}
                className={buttonVariants({
                  size: "icon",
                  variant: link === page ? "outline" : "ghost",
                })}
                isActive={link === page}
                render={<Link to={{ search: pageSearch(link) }} />}
              >
                {link}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          {page < pageCount ? (
            <PaginationNext
              className={stepClass}
              render={<Link to={{ search: pageSearch(page + 1) }} />}
            />
          ) : (
            <PaginationNext aria-disabled={true} className={disabledClass} />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function RecipeListPage({ recipes }: { recipes: readonly Recipe[] }) {
  const [searchParams] = useSearchParams();
  const { items, page, pageCount } = paginate(
    recipes,
    parsePage(searchParams.get("page")),
  );
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 sm:p-8">
      <title>ui-atoms recipes</title>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">ui-atoms recipes</h1>
        <p className="text-muted-foreground text-sm">
          {recipes.length === 1 ? "1 recipe" : `${recipes.length} recipes`}{" "}
          composed from @tilli.dev/ui-atoms
          {pageCount > 1 && ` · page ${page} of ${pageCount}`}
        </p>
      </header>
      {items.length === 0 ? (
        <p className="text-muted-foreground">
          No recipes yet. Run <code>pnpm --filter playground recipe</code> to
          create one.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((recipe) => (
            <li key={recipe.slug}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
      {pageCount > 1 && <RecipePagination page={page} pageCount={pageCount} />}
    </main>
  );
}
