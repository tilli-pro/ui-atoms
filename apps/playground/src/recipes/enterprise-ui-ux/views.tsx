import { SidebarInset } from "@tilli.dev/ui-atoms/sidebar";

/** The content area: the inset card next to an inset sidebar, or a plain column next to a flush one. */
export function ContentView({
  children,
  useInset,
}: {
  children: React.ReactNode;
  useInset?: boolean;
}) {
  return useInset ? (
    <SidebarInset>{children}</SidebarInset>
  ) : (
    <div className="flex flex-1 flex-col">{children}</div>
  );
}
