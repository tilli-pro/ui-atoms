import { Button } from "@tilli.dev/ui-atoms/button";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : String(error);
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 p-8">
      <title>Error · ui-atoms recipes</title>
      <h1 className="font-semibold text-2xl">Something went wrong</h1>
      <pre className="whitespace-pre-wrap text-muted-foreground text-sm">
        {message}
      </pre>
      <Button render={<Link to="/" />} variant="outline">
        All recipes
      </Button>
    </main>
  );
}
