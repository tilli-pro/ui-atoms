import {
  Activity,
  BookOpenText,
  Bot,
  Building2,
  CalendarClock,
  ChartColumn,
  CircleDollarSign,
  ClipboardList,
  ContactRound,
  CreditCard,
  FileText,
  Globe,
  Handshake,
  HardHat,
  Headset,
  House,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  type LucideIcon,
  Mail,
  Megaphone,
  Package,
  Receipt,
  Search,
  Share2,
  ShoppingCart,
  Ticket,
  Timer,
  TriangleAlert,
  UserPlus,
  Users,
  Workflow,
  Wrench,
} from "lucide-react";
import type { IconName } from "./icons.js";

/** One entry of a module's menu. */
export type SectionItem = { label: string; icon: LucideIcon };

/**
 * The rail's sections, one per module. The first icon of each option list is
 * its default; `items` are the entries of the module's menu and `blurb` the
 * line under its dashboard title. The menus follow the beacon-enterprise duplication audit
 * (docs/v2/recon/2026-11-10-authenticated-ui-duplication-recon.md): each table
 * has one home, and module intersections are explicit items.
 */
export const sections = [
  {
    key: "network",
    title: "Network",
    options: ["BookUser", "Network", "Users", "ContactRound", "Building2"],
    items: [
      { label: "Contacts", icon: ContactRound },
      { label: "Organizations", icon: Building2 },
      { label: "Directory", icon: Globe },
      { label: "Activity", icon: Activity },
    ],
    blurb:
      "Every party you deal with, and how connected they are on the network.",
  },
  {
    key: "engage",
    title: "Engage",
    options: ["Megaphone", "Send", "RadioTower", "MessageSquareHeart"],
    items: [
      { label: "Campaigns", icon: Megaphone },
      { label: "Audiences", icon: Users },
      { label: "Templates", icon: LayoutTemplate },
      { label: "Sent", icon: Mail },
      { label: "Social Hub", icon: Share2 },
      { label: "Applications", icon: ClipboardList },
    ],
    blurb: "Outbound reach: campaigns, messages and forms, and how they land.",
  },
  {
    key: "sales",
    title: "Sales",
    options: ["Handshake", "Target", "TrendingUp", "BadgeDollarSign"],
    items: [
      { label: "Leads", icon: UserPlus },
      { label: "Deals", icon: Handshake },
      { label: "Quotes", icon: FileText },
      { label: "Orders", icon: ShoppingCart },
    ],
    blurb: "The pipeline from first contact to a confirmed order.",
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
      { label: "Receivables", icon: Receipt },
      { label: "Payables", icon: CreditCard },
      { label: "Payments", icon: CircleDollarSign },
      { label: "Ledger", icon: BookOpenText },
      { label: "Catalogue", icon: Package },
    ],
    blurb: "What is owed to you, what you owe, and where the cash is.",
  },
  {
    key: "operations",
    title: "Operations",
    options: ["Wrench", "HardHat", "CalendarCheck", "ClipboardList"],
    items: [
      { label: "Calendar", icon: CalendarClock },
      { label: "Services", icon: Wrench },
      { label: "Staff", icon: HardHat },
      { label: "Work orders", icon: ClipboardList },
      { label: "Timesheets", icon: Timer },
      { label: "Outages", icon: TriangleAlert },
    ],
    blurb:
      "Delivering what was sold: bookings, crews, work and the time it takes.",
  },
  {
    key: "support",
    title: "Support",
    options: ["LifeBuoy", "Headset", "Ticket", "Inbox"],
    items: [
      { label: "Inbox", icon: Inbox },
      { label: "Tickets", icon: Ticket },
      { label: "Agent desk", icon: Headset },
    ],
    blurb:
      "Inbound customer work: threads, escalations and tickets, and who is on them.",
  },
] as const satisfies readonly {
  key: string;
  title: string;
  options: readonly IconName[];
  items: readonly SectionItem[];
  blurb: string;
}[];

export type Section = (typeof sections)[number];

export type SectionKey = Section["key"];

export const sectionKeys = sections.map((section) => section.key);

export const sectionByKey = Object.fromEntries(
  sections.map((section) => [section.key, section]),
) as Record<SectionKey, Section>;

/** Each section's default rail icon: the first of its options. */
export const defaultIcons = Object.fromEntries(
  sections.map((section) => [section.key, section.options[0]]),
) as Record<SectionKey, IconName>;

/**
 * Enterprise is the cross-cutting module behind the brand square: what spans every
 * other module (the user's own inbox, search, analytics, automation) rather
 * than a seventh business area.
 */
export const enterpriseItems: readonly SectionItem[] = [
  { label: "Inbox", icon: Inbox },
  { label: "Search", icon: Search },
  { label: "Analytics", icon: ChartColumn },
  { label: "Workflows", icon: Workflow },
  { label: "AI agents", icon: Bot },
];

export const enterpriseBlurb =
  "Everything that needs you today, across every module.";

/**
 * A module is what the second sidebar shows: Enterprise (the default view, Command
 * icon, no color) or one of the rail sections. The active module is the URL
 * hash, `#/<key>`, so it survives reloads without a second router; no hash or
 * an unknown one means Enterprise.
 */
export type ModuleKey = "enterprise" | SectionKey;

export const moduleKeys: readonly ModuleKey[] = ["enterprise", ...sectionKeys];

export const isModuleKey = (value: string): value is ModuleKey =>
  (moduleKeys as readonly string[]).includes(value);

/** Menu items of a module: Enterprise's own list, or the rail section's. */
export const itemsOf = (module: ModuleKey): readonly SectionItem[] =>
  module === "enterprise" ? enterpriseItems : sectionByKey[module].items;

/**
 * The module's overview as a menu row: "Overview" for a rail module, "Home"
 * for Enterprise. It routes to the bare module hash (its dashboard), not to a
 * slug, so the rail button, this row and a fresh load all share one active
 * state. Shown only when the "overview" control is on; otherwise the panel
 * header is the link.
 */
export const overviewItemOf = (module: ModuleKey): SectionItem =>
  module === "enterprise"
    ? { label: "Home", icon: House }
    : { label: "Overview", icon: LayoutDashboard };

/** Title and blurb of a module's dashboard. */
export const homeOf = (module: ModuleKey): { title: string; blurb: string } =>
  module === "enterprise"
    ? { title: "Enterprise", blurb: enterpriseBlurb }
    : { title: sectionByKey[module].title, blurb: sectionByKey[module].blurb };
