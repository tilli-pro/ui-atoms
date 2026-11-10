import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tilli.dev/ui-atoms/sidebar";
import type { LucideIcon } from "lucide-react";
import {
  homeOf,
  itemsOf,
  type ModuleKey,
  overviewItemOf,
  type SectionItem,
  type SectionKey,
  sectionByKey,
} from "./modules.js";
import {
  classes,
  colorfulPanelHeaderClassName,
  type Gradient,
} from "./theme.js";
import type { Route } from "./routing.js";

function OverviewRow({
  isActive,
  item,
  onClick,
}: {
  isActive: boolean;
  item: SectionItem;
  onClick: () => void;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} onClick={onClick}>
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export type ModulePanelProps = {
  /** The rail icon of the active module, or Command for Enterprise. */
  ActiveIcon: LucideIcon;
  colorful: boolean;
  gradients: Record<SectionKey, Gradient>;
  /** True: the module's overview is the first menu row and the header is a plain label. False: the header is the link. */
  overviewItem: boolean;
  route: Route;
  onSelectModule: (module: ModuleKey) => void;
  onSelectItem: (module: ModuleKey, item: SectionItem) => void;
  useInset: boolean;
};

/** The second sidebar: the active module's name over its menu items; the overview is the header link or the first row. */
export function ModulePanel({
  ActiveIcon,
  colorful,
  gradients,
  overviewItem,
  route,
  onSelectModule,
  onSelectItem,
  useInset,
}: ModulePanelProps) {
  const active = route.module;
  const activeSection =
    active === "enterprise" ? undefined : sectionByKey[active];
  return (
    <Sidebar
      className="hidden min-w-0 flex-1 overflow-hidden md:flex"
      collapsible="none"
    >
      <SidebarHeader
        className={classes(
          "border-b p-4",
          colorful && activeSection && colorfulPanelHeaderClassName,
          colorful && activeSection && useInset && "rounded-r-md",
        )}
        style={
          colorful && activeSection
            ? ({
                "--from": gradients[activeSection.key].from,
                "--to": gradients[activeSection.key].to,
              } as React.CSSProperties)
            : undefined
        }
      >
        {overviewItem ? (
          // A plain label; the Overview row below carries the active state.
          <h2 className="flex items-center gap-2 font-semibold text-sm">
            <ActiveIcon className="size-4 shrink-0" />
            <span className="truncate">{homeOf(active).title}</span>
          </h2>
        ) : (
          // The module's default view: active unless a menu item is selected.
          <button
            aria-current={route.item ? undefined : "page"}
            className={classes(
              "flex w-full items-center gap-2 rounded-md text-left text-sm outline-hidden ring-sidebar-ring focus-visible:ring-2",
              route.item
                ? "font-medium opacity-70 hover:opacity-100"
                : "font-semibold",
            )}
            onClick={() => onSelectModule(active)}
            type="button"
          >
            <ActiveIcon className="size-4 shrink-0" />
            <span className="truncate">{homeOf(active).title}</span>
          </button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItem && (
                <OverviewRow
                  isActive={!route.item}
                  item={overviewItemOf(active)}
                  onClick={() => onSelectModule(active)}
                />
              )}
              {itemsOf(active).map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={route.item === item}
                    onClick={() => onSelectItem(active, item)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
