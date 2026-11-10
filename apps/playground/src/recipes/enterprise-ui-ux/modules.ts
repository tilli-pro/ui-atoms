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
 * A module's default view: a dashboard scoped to that module, the way the
 * app's home dashboard is scoped to nobody in particular. Figures and panels
 * are sample copy; the layout is what the recipe is for.
 */
export type ModuleHome = {
  blurb: string;
  stats: readonly { label: string; value: string; hint: string }[];
  panels: readonly { title: string; description: string }[];
};

/**
 * The rail's sections, one per module. The first icon of each option list is
 * its default; `items` are the entries of the module's menu and `home` its
 * dashboard. The menus follow the beacon-enterprise duplication audit
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
    home: {
      blurb:
        "Every party you deal with, and how connected they are on the network.",
      stats: [
        { label: "Organizations", value: "1,284", hint: "+12 this week" },
        {
          label: "Connected on Enterprise",
          value: "86",
          hint: "7% of organizations",
        },
        {
          label: "Pending invites",
          value: "9",
          hint: "3 expire within 7 days",
        },
        {
          label: "Exchanges awaiting review",
          value: "3",
          hint: "oldest 2 days",
        },
      ],
      panels: [
        {
          title: "Connect requests",
          description: "Partners asking to connect with you.",
        },
        {
          title: "Recent exchanges",
          description: "Documents sent and received over the network.",
        },
        {
          title: "Directory matches",
          description:
            "Organizations in your book that are on Enterprise but not connected.",
        },
      ],
    },
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
    home: {
      blurb:
        "Outbound reach: campaigns, messages and forms, and how they land.",
      stats: [
        { label: "Campaigns live", value: "4", hint: "2 end this week" },
        { label: "Sent today", value: "2,310", hint: "email 71% · sms 29%" },
        { label: "Reply rate", value: "6.2%", hint: "+0.8 pts vs last week" },
        { label: "Audiences", value: "18", hint: "2 awaiting approval" },
      ],
      panels: [
        {
          title: "Campaign performance",
          description: "Delivery, opens and replies per live campaign.",
        },
        {
          title: "Recent sends",
          description: "The latest outbound messages across channels.",
        },
        {
          title: "Templates in review",
          description: "Drafts waiting for approval.",
        },
      ],
    },
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
    home: {
      blurb: "The pipeline from first contact to a confirmed order.",
      stats: [
        { label: "Open deals", value: "37", hint: "11 closing this month" },
        { label: "Pipeline", value: "$1.2M", hint: "weighted $640k" },
        { label: "Quotes awaiting", value: "11", hint: "4 expire this week" },
        { label: "Orders this month", value: "24", hint: "+6 vs last month" },
      ],
      panels: [
        {
          title: "Pipeline by stage",
          description: "Deal value at each stage.",
        },
        {
          title: "Quotes expiring",
          description: "Quotes the customer has not accepted yet.",
        },
        {
          title: "Recent orders",
          description: "Sales and purchase orders, newest first.",
        },
      ],
    },
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
    home: {
      blurb: "What is owed to you, what you owe, and where the cash is.",
      stats: [
        { label: "Receivable", value: "$318k", hint: "14 overdue" },
        { label: "Payable", value: "$92k", hint: "6 to approve" },
        {
          label: "Collected this month",
          value: "$205k",
          hint: "68% of invoiced",
        },
        { label: "Cash in 30 days", value: "$226k", hint: "projected" },
      ],
      panels: [
        {
          title: "Aging",
          description: "Receivables and payables by days outstanding.",
        },
        {
          title: "Bills to approve",
          description: "Payables waiting on an approval.",
        },
        { title: "Recent payments", description: "In and out, newest first." },
      ],
    },
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
    home: {
      blurb:
        "Delivering what was sold: bookings, crews, work and the time it takes.",
      stats: [
        { label: "Appointments today", value: "19", hint: "3 unassigned" },
        { label: "Work orders open", value: "42", hint: "8 over budget" },
        { label: "Timesheets to approve", value: "8", hint: "31.5 hours" },
        { label: "Active outages", value: "1", hint: "240 customers affected" },
      ],
      panels: [
        {
          title: "Today's calendar",
          description: "Appointments per staff member.",
        },
        {
          title: "Approval queue",
          description: "Submitted time waiting for approval.",
        },
        { title: "Outage map", description: "Active outages by service area." },
      ],
    },
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
    home: {
      blurb:
        "Inbound customer work: threads, escalations and tickets, and who is on them.",
      stats: [
        { label: "Inbox unread", value: "23", hint: "9 escalated by AI" },
        { label: "Open tickets", value: "57", hint: "12 assigned to me" },
        { label: "SLA at risk", value: "4", hint: "next breach in 40 min" },
        { label: "Agents online", value: "6", hint: "2 on a call" },
      ],
      panels: [
        {
          title: "Triage queue",
          description: "Unassigned threads and escalations.",
        },
        { title: "SLA watch", description: "Tickets closest to breaching." },
        {
          title: "Agent status",
          description: "Presence and current load per agent.",
        },
      ],
    },
  },
] as const satisfies readonly {
  key: string;
  title: string;
  options: readonly IconName[];
  items: readonly SectionItem[];
  home: ModuleHome;
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

export const enterpriseHome: ModuleHome = {
  blurb: "Everything that needs you today, across every module.",
  stats: [
    { label: "Inbox unread", value: "12", hint: "4 mention you" },
    { label: "My open tickets", value: "7", hint: "1 SLA at risk" },
    { label: "Due this week", value: "$42.3k", hint: "9 invoices" },
    { label: "Workflows running", value: "5", hint: "1 failed overnight" },
  ],
  panels: [
    {
      title: "My inbox",
      description: "Threads, escalations and approvals assigned to you.",
    },
    {
      title: "Workflow runs",
      description: "Automation across modules, latest first.",
    },
    {
      title: "Analytics highlights",
      description: "The figures that moved this week.",
    },
  ],
};

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

/** Title and dashboard of a module. */
export const homeOf = (
  module: ModuleKey,
): { title: string; home: ModuleHome } =>
  module === "enterprise"
    ? { title: "Enterprise", home: enterpriseHome }
    : { title: sectionByKey[module].title, home: sectionByKey[module].home };
