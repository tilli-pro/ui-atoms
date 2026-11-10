import { Spinner } from "@tilli.dev/ui-atoms/spinner";

export function LoadingPage() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <Spinner />
    </main>
  );
}
