import { SidebarInset } from "@tilli.dev/ui-atoms/sidebar";

/**
 * The content area: the inset card next to an inset sidebar, or a plain column next to a flush one.
 * `min-w-0` lets the column shrink below its content's intrinsic width (a flex item defaults to
 * `min-width: auto`), so wide tables scroll inside their own container instead of widening the page.
 */
export function ContentView({
  children,
  useInset,
}: {
  children: React.ReactNode;
  useInset?: boolean;
}) {
  return useInset ? (
    <SidebarInset className="min-w-0">{children}</SidebarInset>
  ) : (
    <div className="flex min-w-0 flex-1 flex-col">{children}</div>
  );
}
