import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import { SidebarInset } from "@tilli.dev/ui-atoms/sidebar";
import { Skeleton } from "@tilli.dev/ui-atoms/skeleton";
import type { LucideIcon } from "lucide-react";
import { classes } from "./theme.js";
import type { ModuleHome, SectionItem } from "./modules.js";

/** Skeleton lines standing in for a list or chart; widths double as keys. */
const placeholderWidths = [
  "w-full",
  "w-11/12",
  "w-5/6",
  "w-3/4",
  "w-2/3",
  "w-7/12",
  "w-1/2",
  "w-5/12",
] as const;

function PlaceholderRows({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2">
      {placeholderWidths.slice(0, count).map((width) => (
        <Skeleton className={classes("h-4", width)} key={width} />
      ))}
    </div>
  );
}

/** A module's root route: its dashboard. */
export function ModuleHomeView({
  Icon,
  home,
  title,
}: {
  Icon: LucideIcon;
  home: ModuleHome;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-semibold text-2xl">
          <Icon className="size-6" />
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{home.blurb}</p>
      </header>
      <section
        aria-label="Key figures"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {home.stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              {stat.hint}
            </CardContent>
          </Card>
        ))}
      </section>
      <section aria-label="Panels" className="grid gap-4 lg:grid-cols-3">
        {home.panels.map((panel) => (
          <Card key={panel.title}>
            <CardHeader>
              <CardTitle>{panel.title}</CardTitle>
              <CardDescription>{panel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <PlaceholderRows count={4} />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

/** A module menu item's route: a placeholder for its list view. */
export function ItemView({
  item,
  moduleTitle,
}: {
  item: SectionItem;
  moduleTitle: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs uppercase">{moduleTitle}</p>
        <h1 className="flex items-center gap-2 font-semibold text-2xl">
          <item.icon className="size-6" />
          {item.label}
        </h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>{item.label}</CardTitle>
          <CardDescription>List view to come.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceholderRows count={8} />
        </CardContent>
      </Card>
    </div>
  );
}

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
