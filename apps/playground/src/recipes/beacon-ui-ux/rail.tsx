import { useRef } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tilli.dev/ui-atoms/avatar";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@tilli.dev/ui-atoms/menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@tilli.dev/ui-atoms/sidebar";
import { Command, Settings } from "lucide-react";
import { type IconName, icons } from "./icons.js";
import {
  type ModuleKey,
  overviewItemOf,
  type SectionItem,
  type SectionKey,
  sectionKeys,
  sections,
} from "./modules.js";
import {
  brandSquareClassName,
  brandSquareIdleClassName,
  brandSquareSelectedClassName,
  classes,
  colorfulItemClassName,
  colorfulMenuHeaderClassName,
  type Gradient,
  menuHeaderClassName,
  monochromeItemClassName,
} from "./theme.js";

/**
 * Section menus are hover previews; the rail button itself navigates. Cancel
 * every press-driven open/close so a click neither toggles the menu nor moves
 * focus into it; the button's onClick then closes the menu imperatively via
 * `actionsRef` (a press within 500ms of a hover open would otherwise be
 * treated as "keep open" by Base UI).
 */
const ignoreTriggerPress: React.ComponentProps<typeof Menu>["onOpenChange"] = (
  _open,
  details,
) => {
  if (details.reason === "trigger-press") details.cancel();
};

type MenuActionsRef = NonNullable<
  React.ComponentProps<typeof Menu>["actionsRef"]
>;

/** One imperative-actions ref per section menu, created once. */
const createMenuActionRefs = () =>
  Object.fromEntries(
    sectionKeys.map((key) => [key, { current: null }]),
  ) as Record<SectionKey, MenuActionsRef>;

export type RailProps = {
  active: ModuleKey;
  colorful: boolean;
  gradients: Record<SectionKey, Gradient>;
  /** True: each hover menu starts with the module's Overview row. */
  overviewItem: boolean;
  /** The rail icon chosen for each section. */
  selected: Record<SectionKey, IconName>;
  onSelectModule: (module: ModuleKey) => void;
  onSelectItem: (module: SectionKey, item: SectionItem) => void;
};

/**
 * The icon rail: the brand square (Beacon), one button per module, settings
 * and the account. Hovering a module previews its menu, except the active
 * module while the panel is open: its menu is already on screen, so the button
 * shows only a tooltip. With the panel collapsed the hover menu is the only way
 * to its items, so every module gets the menu again.
 */
export function Rail({
  active,
  colorful,
  gradients,
  overviewItem,
  selected,
  onSelectModule,
  onSelectItem,
}: RailProps) {
  const menuActions = useRef(createMenuActionRefs()).current;
  const { state } = useSidebar();
  const panelOpen = state === "expanded";
  return (
    <Sidebar
      className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      collapsible="none"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="md:h-8 md:p-0"
              isActive={active === "beacon"}
              onClick={() => onSelectModule("beacon")}
              size="lg"
              tooltip={{ children: "Beacon", hidden: false }}
            >
              <div
                className={classes(
                  brandSquareClassName,
                  active === "beacon"
                    ? brandSquareSelectedClassName
                    : brandSquareIdleClassName,
                )}
              >
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Acme Inc</span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {sections.map((section) => {
                const Icon = icons[selected[section.key]];
                const isActive = active === section.key;
                const overview = overviewItemOf(section.key);
                const buttonProps = {
                  className: classes(
                    "px-2.5 md:px-2",
                    colorful ? colorfulItemClassName : monochromeItemClassName,
                  ),
                  isActive,
                  style: {
                    "--from": gradients[section.key].from,
                    "--to": gradients[section.key].to,
                  } as React.CSSProperties,
                };
                if (isActive && panelOpen) {
                  return (
                    <SidebarMenuItem key={section.key}>
                      <SidebarMenuButton
                        {...buttonProps}
                        onClick={() => onSelectModule(section.key)}
                        tooltip={{ children: section.title, hidden: false }}
                      >
                        <Icon />
                        <span>{section.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                return (
                  <SidebarMenuItem key={section.key}>
                    <Menu
                      actionsRef={menuActions[section.key]}
                      onOpenChange={ignoreTriggerPress}
                    >
                      <MenuTrigger
                        delay={0}
                        openOnHover={true}
                        render={
                          <SidebarMenuButton
                            {...buttonProps}
                            onClick={() => {
                              onSelectModule(section.key);
                              menuActions[section.key].current?.close();
                            }}
                          />
                        }
                      >
                        <Icon />
                        <span>{section.title}</span>
                      </MenuTrigger>
                      {/* The popup is portaled, so the button's `--from`
                          can't be inherited; pass the first stop directly. */}
                      <MenuPopup
                        align="start"
                        className="w-56"
                        side="right"
                        sideOffset={8}
                        style={
                          colorful
                            ? ({
                                "--from": gradients[section.key].from,
                                borderColor: gradients[section.key].from,
                              } as React.CSSProperties)
                            : undefined
                        }
                      >
                        <MenuGroup>
                          <MenuGroupLabel
                            className={classes(
                              menuHeaderClassName,
                              colorful && colorfulMenuHeaderClassName,
                            )}
                            // biome-ignore lint/a11y/useHeadingContent: Base UI renders the section title as the h2's children
                            render={<h2 />}
                          >
                            {section.title}
                          </MenuGroupLabel>
                          {overviewItem && (
                            <MenuItem
                              onClick={() => onSelectModule(section.key)}
                            >
                              <overview.icon />
                              {overview.label}
                            </MenuItem>
                          )}
                          {section.items.map((item) => (
                            <MenuItem
                              key={item.label}
                              onClick={() => onSelectItem(section.key, item)}
                            >
                              <item.icon />
                              {item.label}
                            </MenuItem>
                          ))}
                        </MenuGroup>
                      </MenuPopup>
                    </Menu>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              aria-label="Settings"
              className="px-2.5 md:px-2"
              tooltip={{ children: "Settings", hidden: false }}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Menu>
              <MenuTrigger
                aria-label="Account"
                delay={0}
                openOnHover={true}
                render={
                  <SidebarMenuButton className="md:h-8 md:p-0" size="lg" />
                }
              >
                <Avatar className="rounded-lg">
                  <AvatarImage
                    alt=""
                    src="https://avatars.githubusercontent.com/u/2670350"
                  />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
              </MenuTrigger>
              {/* Account menu: items to come. */}
              <MenuPopup align="end" className="min-h-24 w-56" side="right" />
            </Menu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
