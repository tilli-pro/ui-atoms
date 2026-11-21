import { Button } from "@tilli.dev/ui-atoms/button";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 p-8">
      <title>Not found · ui-atoms recipes</title>
      <h1 className="font-semibold text-2xl">Page not found</h1>
      <p className="text-muted-foreground">
        There is no recipe or page at this address.
      </p>
      <Button render={<Link to="/" />} variant="outline">
        All recipes
      </Button>
    </main>
  );
}
