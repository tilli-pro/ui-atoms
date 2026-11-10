import { useRef, useState } from "react";
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
  SidebarProvider,
} from "@tilli.dev/ui-atoms/sidebar";
import {
  BadgeDollarSign,
  BookOpenText,
  BookUser,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CircleDollarSign,
  Command,
  ContactRound,
  CreditCard,
  FileText,
  Filter,
  Handshake,
  Headset,
  Landmark,
  LifeBuoy,
  type LucideIcon,
  Megaphone,
  MessageSquareHeart,
  Network,
  Package,
  RadioTower,
  Receipt,
  Send,
  Settings,
  Share2,
  ShoppingCart,
  Target,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  type ControlInput,
  type ControlType,
  useControl,
} from "../control-panel/index.js";

/** Every icon a rail section can be switched to, by its lucide name. */
const icons = {
  BadgeDollarSign,
  BookUser,
  Building2,
  Calculator,
  CalendarCheck,
  CircleDollarSign,
  ContactRound,
  Handshake,
  Headset,
  Landmark,
  LifeBuoy,
  Megaphone,
  MessageSquareHeart,
  Network,
  Receipt,
  RadioTower,
  Send,
  Target,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} satisfies Record<string, LucideIcon>;

type IconName = keyof typeof icons;

/** Width of the whole nested sidebar: the icon rail plus a regular 14rem sidebar. */
const NESTED_SIDEBAR_WIDTH = "calc(var(--sidebar-width-icon) + 1px + 14rem)";

/** One entry of a section's hover menu. */
type SectionItem = { label: string; icon: LucideIcon };

/**
 * The rail's sections; the first icon of each option list is its default and
 * `items` are the entries of the section's hover menu.
 */
const sections = [
  {
    key: "network",
    title: "Network",
    options: ["BookUser", "Network", "Users", "ContactRound", "Building2"],
    items: [
      { label: "Contacts", icon: ContactRound },
      { label: "Organizations", icon: Building2 },
      { label: "Filters", icon: Filter },
    ],
  },
  {
    key: "engage",
    title: "Engage",
    options: ["Megaphone", "Send", "RadioTower", "MessageSquareHeart"],
    items: [
      { label: "Audiences", icon: Users },
      { label: "Social Hub", icon: Share2 },
      { label: "Campaigns", icon: Megaphone },
    ],
  },
  {
    key: "sales",
    title: "Sales",
    options: ["Handshake", "Target", "TrendingUp", "BadgeDollarSign"],
    items: [
      { label: "Deals", icon: Handshake },
      { label: "Quotes", icon: FileText },
      { label: "Sales Orders", icon: ShoppingCart },
    ],
  },
  {
    key: "finance",
    title: "Finance",
    options: [
      "Landmark",
      "Wallet",
      "Receipt",
      "CircleDollarSign",
      "Calculator",
    ],
    items: [
      { label: "Ledger", icon: BookOpenText },
      { label: "Accounts Payable", icon: CreditCard },
      { label: "Accounts Receivable", icon: Receipt },
      { label: "Catalogue", icon: Package },
    ],
  },
  {
    key: "support",
    title: "Support",
    options: ["LifeBuoy", "Headset", "Wrench", "Ticket", "CalendarCheck"],
    items: [
      { label: "Service Desk", icon: Headset },
      { label: "Services", icon: Wrench },
      { label: "Scheduling", icon: CalendarClock },
    ],
  },
] as const satisfies readonly {
  key: string;
  title: string;
  options: readonly IconName[];
  items: readonly SectionItem[];
}[];

const sectionKeys = sections.map((section) => section.key);

type SectionKey = (typeof sections)[number]["key"];

const sectionByKey = Object.fromEntries(
  sections.map((section) => [section.key, section]),
) as Record<SectionKey, (typeof sections)[number]>;

/**
 * A module is what the second sidebar shows: Beacon (the default view, Command
 * icon, no color) or one of the rail sections. The active module is the URL
 * hash, `#/<key>`, so it survives reloads without a second router; no hash or
 * an unknown one means Beacon.
 */
type ModuleKey = "beacon" | SectionKey;

const moduleKeys: readonly ModuleKey[] = ["beacon", ...sectionKeys];

const HASH_PREFIX = /^#\/?/;

const isModuleKey = (value: string): value is ModuleKey =>
  (moduleKeys as readonly string[]).includes(value);

const SPACES = /\s+/g;

/** URL segment of a menu item: "Accounts Payable" → "accounts-payable". */
const itemSlug = (item: SectionItem): string =>
  item.label.toLowerCase().replace(SPACES, "-");

/**
 * The recipe's internal route, `#/<module>` or `#/<module>/<item>`: a module
 * view, or one of its menu items as its own view. Anything unknown falls back
 * to the module, then to Beacon.
 */
type Route = { module: ModuleKey; item?: SectionItem };

const routeFromHash = (hash: string): Route => {
  const [moduleKey = "", slug] = hash.replace(HASH_PREFIX, "").split("/");
  if (!isModuleKey(moduleKey)) return { module: "beacon" };
  if (moduleKey === "beacon" || slug === undefined)
    return { module: moduleKey };
  const item = sectionByKey[moduleKey].items.find(
    (candidate) => itemSlug(candidate) === slug,
  );
  return item ? { module: moduleKey, item } : { module: moduleKey };
};

const hashFor = (module: ModuleKey, item?: SectionItem): string =>
  item ? `#/${module}/${itemSlug(item)}` : `#/${module}`;

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

/** Join class fragments; none of these overlap, so no merge is needed. */
const classes = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(" ");

type Gradient = { from: string; to: string };

/**
 * Default gradient per section: the hue's most saturated in-gamut color, running
 * to a stop 40–55° around the wheel, rotated away from the neighbouring section.
 * Any CSS color string works here and in the control panel.
 */
const defaultGradients: Record<SectionKey, Gradient> = {
  network: { from: "#0280f7", to: "#08c2ca" }, // h255 → h200
  engage: { from: "#fd0797", to: "#f95801" }, // h355 → h40
  sales: { from: "#fb8304", to: "#d0af07" }, // h55 → h95
  finance: { from: "#04cfa2", to: "#a3c003" }, // h170 → h120
  support: { from: "#740bfe", to: "#fb02b8" }, // h290 → h345
};

/** True for anything the browser accepts as a color: hex, hsl(), oklch(), oklab(), names… */
const isCssColor = (value: string): boolean =>
  typeof CSS === "undefined" || typeof CSS.supports !== "function"
    ? value.trim().length > 0
    : CSS.supports("color", value.trim());

/**
 * Colorful rail items: a faint tint of the section gradient behind a stroke
 * darkened from its first stop (`--section-ink-mix` in styles.css keeps the
 * stroke undarkened in dark mode). The active item shows the full gradient
 * with a white stroke. `--from`/`--to` are set inline per item.
 */
const colorfulItemClassName = classes(
  "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--from)_20%,transparent),color-mix(in_oklab,var(--to)_8%,transparent))]",
  "[&>svg]:text-[color-mix(in_oklab,var(--from)_var(--section-ink-mix),black)]",
  "data-[active=true]:bg-[linear-gradient(135deg,var(--from),var(--to))] data-[active=true]:[&>svg]:text-white",
);

/** Section menu header: the group label (already text-xs) in unselectable uppercase foreground text. */
const menuHeaderClassName = "select-none text-foreground uppercase";

/**
 * Colorful header text: the section's first stop pulled toward the theme ink
 * (`--section-heading-mix` / `--section-heading-ink` in styles.css). Reads the
 * `--from` set inline on the popup, since the portaled popup inherits nothing
 * from the rail button.
 */
const colorfulMenuHeaderClassName =
  "text-[color-mix(in_oklab,var(--from)_var(--section-heading-mix),var(--section-heading-ink))]";

/**
 * Second-sidebar header for a colorful section: the same faint tint as its rail
 * item behind the heading-mix text. Beacon and monochrome mode use the plain header.
 */
const colorfulPanelHeaderClassName = classes(
  "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--from)_20%,transparent),color-mix(in_oklab,var(--to)_8%,transparent))]",
  colorfulMenuHeaderClassName,
);

/** The brand square in the rail header: solid primary, or outlined while Beacon is the active module. */
const brandSquareClassName =
  "flex aspect-square size-8 items-center justify-center rounded-lg";
const brandSquareIdleClassName =
  "bg-sidebar-primary text-sidebar-primary-foreground";
const brandSquareSelectedClassName =
  "bg-transparent text-sidebar-primary ring-2 ring-sidebar-ring ring-inset";

/** Monochrome rail items: no gradient; the active item is a solid primary fill. */
const monochromeItemClassName =
  "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground";

const defaultIcons = Object.fromEntries(
  sections.map((section) => [section.key, section.options[0]]),
) as Record<SectionKey, IconName>;

export default function NestedSidebar() {
  const [selected, setSelected] =
    useState<Record<SectionKey, IconName>>(defaultIcons);
  const location = useLocation();
  const navigate = useNavigate();
  const route = routeFromHash(location.hash);
  const active = route.module;
  const go = (hash: string): void =>
    void navigate(
      { hash, pathname: location.pathname, search: location.search },
      { replace: true },
    );
  const setActive = (key: ModuleKey): void => go(hashFor(key));
  const activeSection = active === "beacon" ? undefined : sectionByKey[active];
  const ActiveIcon = activeSection
    ? icons[selected[activeSection.key]]
    : Command;
  const [colorful, setColorful] = useState(true);
  const [gradients, setGradients] =
    useState<Record<SectionKey, Gradient>>(defaultGradients);
  const menuActions = useRef(createMenuActionRefs()).current;

  // One select control per section; picking an option swaps that rail icon.
  const controls = {} as Record<SectionKey, ControlInput<ControlType>>;
  for (const section of sections) {
    controls[section.key] = {
      value: selected[section.key],
      options: [...section.options],
      persist: true,
      onChange: (value) =>
        setSelected((prev) => ({ ...prev, [section.key]: value as IconName })),
    };
  }
  useControl(controls, { group: "sidebar icons", collapsed: false });
  useControl(
    {
      colorful: {
        value: colorful,
        persist: true,
        onChange: (value) => setColorful(value === true),
      },
      active: {
        value: active,
        options: [...moduleKeys],
        onChange: (value) => {
          if (typeof value === "string" && isModuleKey(value)) setActive(value);
        },
      },
    },
    { group: "sidebar style", collapsed: false, order: -1 },
  );
  const gradientControls: Record<string, ControlInput<ControlType>> = {
    // Sorts first (order -1); the field values below follow it.
    "reset gradients": {
      type: "action",
      order: -1,
      actionProps: { children: "Reset to defaults" },
      onChange: () => setGradients(defaultGradients),
    },
  };
  for (const section of sections) {
    for (const stop of ["from", "to"] as const) {
      gradientControls[`${section.key}-${stop}`] = {
        type: "text",
        value: gradients[section.key][stop],
        persist: true,
        onChange: (value) => {
          if (typeof value !== "string" || !isCssColor(value)) return;
          setGradients((prev) => ({
            ...prev,
            [section.key]: { ...prev[section.key], [stop]: value.trim() },
          }));
        },
      };
    }
  }
  useControl(gradientControls, { group: "sidebar gradients", order: 1 });

  return (
    <main className="flex h-full w-full flex-col">
      <SidebarProvider
        style={
          { "--sidebar-width": NESTED_SIDEBAR_WIDTH } as React.CSSProperties
        }
      >
        <Sidebar
          className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
          collapsible="icon"
        >
          {/* This is the first sidebar */}
          {/* We disable collapsible and adjust width to icon. */}
          {/* This will make the sidebar appear as icons. */}
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
                    onClick={() => setActive("beacon")}
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
                                  className={classes(
                                    "px-2.5 md:px-2",
                                    colorful
                                      ? colorfulItemClassName
                                      : monochromeItemClassName,
                                  )}
                                  isActive={active === section.key}
                                  onClick={() => {
                                    setActive(section.key);
                                    menuActions[section.key].current?.close();
                                  }}
                                  style={
                                    {
                                      "--from": gradients[section.key].from,
                                      "--to": gradients[section.key].to,
                                    } as React.CSSProperties
                                  }
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
                                {section.items.map((item) => (
                                  <MenuItem
                                    key={item.label}
                                    onClick={() =>
                                      go(hashFor(section.key, item))
                                    }
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
                        <SidebarMenuButton
                          className="md:h-8 md:p-0"
                          size="lg"
                        />
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
                    <MenuPopup
                      align="end"
                      className="min-h-24 w-56"
                      side="right"
                    />
                  </Menu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          {/* This is the second sidebar */}
          {/* We disable collapsible and let it fill remaining space */}
          <Sidebar
            className="hidden min-w-0 flex-1 overflow-hidden md:flex"
            collapsible="none"
          >
            <SidebarHeader
              className={classes(
                "border-b p-4",
                colorful && activeSection && colorfulPanelHeaderClassName,
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
              {/* The module's default view: active unless a menu item is selected. */}
              <button
                aria-current={route.item ? undefined : "page"}
                className={classes(
                  "flex w-full items-center gap-2 rounded-md text-left text-sm outline-hidden ring-sidebar-ring focus-visible:ring-2",
                  route.item
                    ? "font-medium opacity-70 hover:opacity-100"
                    : "font-semibold",
                )}
                onClick={() => setActive(active)}
                type="button"
              >
                <ActiveIcon className="size-4 shrink-0" />
                <span className="truncate">
                  {activeSection ? activeSection.title : "Beacon"}
                </span>
              </button>
            </SidebarHeader>
            <SidebarContent>
              {/* Menu items of the active module; Beacon has none yet. */}
              {activeSection && (
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {activeSection.items.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            isActive={route.item === item}
                            onClick={() => go(hashFor(activeSection.key, item))}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </SidebarContent>
          </Sidebar>
        </Sidebar>
      </SidebarProvider>
    </main>
  );
}
