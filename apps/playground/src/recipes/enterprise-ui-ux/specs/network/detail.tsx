import {
  ArrowLeftRight,
  BadgePercent,
  Banknote,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  CreditCard,
  FileText,
  GitMerge,
  KeyRound,
  Link2,
  Mail,
  Pencil,
  Repeat,
  RotateCw,
  Send,
  Undo2,
  Wrench,
  X,
} from "lucide-react";
import {
  type PartyDetail,
  partyDetail,
  type Verif,
} from "../../mock/network/detail.js";
import { capitalise, empty, humanise, initialsOf } from "../common.js";
import { networkStatusLabel } from "./labels.js";
import type {
  NetworkContact,
  NetworkOrganization,
} from "../../mock/network.js";
import type {
  ActionSpec,
  BadgeSpec,
  BadgeTone,
  CardContent,
  CardSpec,
  ColumnSpec,
  DetailSpec,
  Field,
  ListItem,
  Persona,
  TabSegment,
  TabSpec,
  Terms,
} from "../types.js";

type Kind = "contact" | "organization";
type PartyRow = NetworkContact | NetworkOrganization;

const isOrganization = (row: PartyRow): row is NetworkOrganization =>
  "networkStatus" in row;

const fmtDate = (at: Date): string =>
  at.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const usd = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );

const facetTerm = (facet: string): ((t: Terms) => string) => {
  switch (facet) {
    case "customer":
      return (t) => t.personCustomer;
    case "vendor":
      return (t) => t.personVendor;
    case "employee":
      return (t) => t.personEmployee;
    case "commercial":
      return (t) => t.orgCustomer;
    case "internal":
      return (t) => t.orgEmployee;
    default:
      return (t) => t.personCustomer;
  }
};

const orgFacetTerm = (facet: string): ((t: Terms) => string) =>
  facet === "vendor" ? (t) => t.orgVendor : facetTerm(facet);

const networkTone: Record<string, BadgeTone> = {
  connected: "success",
  invited: "warning",
  not_invited: "neutral",
};

const outline = { variant: "outline" } as const;

const headerActions: ActionSpec[] = [
  { label: "Edit", icon: Pencil, ...outline },
  { label: "Link", icon: Link2, ...outline },
  { label: "Refresh", icon: RotateCw, ...outline },
];

const menuFor =
  (kind: Kind) =>
  (persona: Persona): (ActionSpec | null)[] => {
    const government = persona.key === "government_federal";
    const items: (ActionSpec | null)[] = [
      { label: "Send payment link", icon: Send },
      ...(kind === "organization"
        ? [{ label: "Take payment", icon: CreditCard } satisfies ActionSpec]
        : []),
      { label: "Send refund link", icon: Undo2 },
      { label: "Send OTP", icon: KeyRound },
      { label: "Set payment arrangement", icon: CalendarClock },
      { label: "Enroll AutoPay", icon: Repeat },
      { label: "Enroll eBill", icon: Mail },
      { label: "Enroll in PayOut", icon: Banknote },
      { label: "Generate enrollment link", icon: Link2 },
      null,
      ...(government
        ? []
        : [
            {
              label: "Start/Stop/Transfer",
              icon: ArrowLeftRight,
              gap: "flow-builder",
            } satisfies ActionSpec,
          ]),
      {
        label: "Schedule appointment",
        icon: CalendarPlus,
        gap: "drag-calendar",
      },
      ...(government
        ? []
        : [
            {
              label: "Create service order",
              icon: Wrench,
            } satisfies ActionSpec,
          ]),
      null,
      { label: "Send bill copy", icon: FileText, gap: "pdf-preview" },
      { label: "Waive fee", icon: BadgePercent },
      null,
      { label: "Send application", icon: ClipboardList },
    ];
    return items;
  };

const verifBadge = (v: Verif): BadgeSpec =>
  v === "verified"
    ? { label: "Verified", tone: "success" }
    : v === "unverified"
      ? { label: "Unverified", tone: "warning" }
      : { label: "Not set", tone: "neutral" };

const yesNo = (value: boolean, yes: string, no: string): Field["value"] =>
  value ? yes : no;

const snapshot = (d: PartyDetail): CardContent => {
  const { account } = d;
  const fields: Field[] = [
    { label: "Current balance", value: account.balance, format: "money" },
    { label: "Past due", value: account.pastDue, format: "money" },
    { label: "Due date", value: account.dueDate, format: "date" },
    {
      label: "Last payment",
      value: account.lastPayment
        ? `${usd(account.lastPayment.amount)} · ${fmtDate(account.lastPayment.at)}`
        : "None",
      format: "text",
    },
    {
      label: "Avg monthly bill",
      value: account.averageMonthlyBill,
      format: "money",
    },
  ];
  const p = account.programs;
  if (p.kind === "utility") {
    fields.push(
      {
        label: "Budget billing",
        value: yesNo(p.budgetBilling, "Enrolled", "Not enrolled"),
        format: "status",
      },
      {
        label: "Payment arrangement",
        value: yesNo(p.paymentArrangement, "Active", "None"),
        format: "status",
      },
      {
        label: "Disconnect protection",
        value: yesNo(p.disconnectProtection, "Protected", "At risk"),
        format: "status",
      },
    );
  } else {
    fields.push(
      { label: "Filing status", value: p.filingStatus, format: "status" },
      { label: "Payment plan", value: p.paymentPlan, format: "status" },
      { label: "Compliance", value: p.compliance, format: "status" },
    );
  }
  fields.push({
    label: "Account types",
    value: account.types.map(capitalise).join(", "),
    format: "badge",
  });
  return { kind: "fields", fields };
};

const additional = (d: PartyDetail): CardContent => ({
  kind: "fields",
  fields: Object.entries(d.customFields).map(([key, value]) => ({
    label: humanise(key),
    value,
    format: "text",
  })),
});

const supplierCard = (d: PartyDetail): CardContent =>
  d.supplier
    ? {
        kind: "fields",
        fields: [
          {
            label: "Supplier number",
            value: d.supplier.number,
            format: "text",
          },
          { label: "Tier", value: d.supplier.tier, format: "text" },
          {
            label: "Supplier status",
            value: d.supplier.status,
            format: "status",
          },
          { label: "Website", value: d.website ?? null, format: "link" },
          {
            label: "Description",
            value: d.supplier.description,
            format: "text",
          },
        ],
      }
    : { kind: "fields", fields: [] };

const spendCard = (d: PartyDetail): CardContent =>
  d.supplier
    ? {
        kind: "fields",
        fields: [
          { label: "YTD spend", value: d.supplier.spend.ytd, format: "money" },
          {
            label: "Variance vs last year",
            value: d.supplier.spend.variancePct,
            format: "percent",
          },
          {
            label: "Open POs",
            value: `${usd(d.supplier.spend.openPoAmount)} · ${d.supplier.spend.openPoCount} orders`,
            format: "text",
          },
          {
            label: "Pending invoices",
            value: d.supplier.spend.pendingInvoices,
            format: "count",
          },
        ],
      }
    : { kind: "fields", fields: [] };

const methodsCard = (d: PartyDetail): CardContent => ({
  kind: "list",
  items: d.methods.map(
    (m): ListItem => ({
      label: m.value,
      value: "",
      hint: capitalise(m.type),
      badge: m.primary
        ? { label: "Primary", tone: "info" }
        : m.verified
          ? { label: "Verified", tone: "success" }
          : { label: "Unverified", tone: "warning" },
    }),
  ),
});

const addressesCard = (d: PartyDetail): CardContent => ({
  kind: "list",
  items: d.addresses.map(
    (a): ListItem => ({
      label: a.line,
      value: "",
      hint: capitalise(a.type),
      ...(a.primary ? { badge: { label: "Primary", tone: "info" } } : {}),
    }),
  ),
});

const preferencesCard = (d: PartyDetail): CardContent => ({
  kind: "list",
  items: [
    { label: "Email", value: "", badge: verifBadge(d.preferences.email) },
    { label: "SMS", value: "", badge: verifBadge(d.preferences.sms) },
    { label: "WhatsApp", value: "", badge: verifBadge(d.preferences.whatsapp) },
    {
      label: "eBill",
      value: "",
      badge: d.preferences.ebill
        ? { label: "Enrolled", tone: "success" }
        : { label: "Not enrolled", tone: "neutral" },
    },
    { label: "Language", value: d.preferences.language },
  ],
});

const instrumentsCard = (d: PartyDetail): CardContent => ({
  kind: "list",
  items: [
    ...d.paymentInstruments.map(
      (i): ListItem => ({
        label: i.label,
        value: "",
        hint: i.type,
        ...(i.isDefault
          ? { badge: { label: "Default", tone: "neutral" } }
          : {}),
      }),
    ),
    d.payout
      ? {
          label: "Payout enrollment",
          value: d.payout.status,
          hint: d.payout.recipientId,
        }
      : { label: "Payout enrollment", value: "Not enrolled" },
  ],
});

const signalsCard = (d: PartyDetail): CardContent => ({
  kind: "list",
  items: [
    ...d.social.map(
      (s): ListItem => ({
        label: capitalise(s.platform),
        value: `${s.candidates} candidates`,
        hint: `${s.confidence}% confidence`,
      }),
    ),
    { label: "Sessions", value: String(d.fingerprints.sessions) },
    { label: "Page views", value: String(d.fingerprints.pageViews) },
    { label: "Devices", value: String(d.fingerprints.devices) },
  ],
});

const cards: CardSpec<PartyDetail>[] = [
  {
    key: "snapshot",
    title: "Account snapshot",
    column: "main",
    content: snapshot,
  },
  {
    key: "additional",
    title: "Additional details",
    column: "main",
    content: additional,
  },
  { key: "supplier", title: "Supplier", column: "main", content: supplierCard },
  {
    key: "spend",
    title: "Spend",
    column: "main",
    gap: "charts",
    content: spendCard,
  },
  {
    key: "methods",
    title: "Contact methods",
    column: "side",
    content: methodsCard,
  },
  {
    key: "addresses",
    title: "Addresses",
    column: "side",
    content: addressesCard,
  },
  {
    key: "preferences",
    title: "Preferences",
    column: "side",
    content: preferencesCard,
  },
  {
    key: "instruments",
    title: "Payment instruments",
    column: "side",
    content: instrumentsCard,
  },
  { key: "signals", title: "Signals", column: "side", content: signalsCard },
];

const invoiceColumns: ColumnSpec[] = [
  { key: "number", header: "Number", format: "link" },
  { key: "status", header: "Status", format: "status" },
  { key: "issueDate", header: "Issue date", format: "date" },
  { key: "dueDate", header: "Due", format: "date" },
  { key: "total", header: "Total", format: "money", align: "end" },
  { key: "balance", header: "Balance", format: "money", align: "end" },
];

const paymentColumns: ColumnSpec[] = [
  { key: "date", header: "Date", format: "date" },
  { key: "document", header: "Document", format: "text" },
  { key: "amount", header: "Amount", format: "money", align: "end" },
  {
    key: "method",
    header: "Method",
    format: "badge",
    accessor: (row) => capitalise(String(row.method)),
  },
  { key: "status", header: "Status", format: "status" },
  { key: "reference", header: "Reference", format: "text" },
];

const ticketColumns: ColumnSpec[] = [
  { key: "number", header: "#", format: "text" },
  { key: "subject", header: "Subject", format: "link" },
  { key: "status", header: "Status", format: "status" },
  { key: "priority", header: "Priority", format: "badge" },
  { key: "assignedTo", header: "Assigned", format: "text" },
  { key: "createdAt", header: "Opened", format: "date" },
];

const interactionColumns: ColumnSpec[] = [
  { key: "type", header: "Type", format: "badge" },
  { key: "direction", header: "Direction", format: "badge" },
  { key: "status", header: "Status", format: "status" },
  { key: "fromTo", header: "From → To", format: "text" },
  { key: "agent", header: "Agent", format: "text" },
  { key: "startedAt", header: "Started", format: "datetime" },
  { key: "durationMinutes", header: "Duration", format: "duration" },
];

const accountColumns: ColumnSpec[] = [
  { key: "number", header: "Account #", format: "link" },
  {
    key: "type",
    header: "Type",
    format: "badge",
    accessor: (row) => capitalise(String(row.type)),
  },
  { key: "status", header: "Status", format: "status" },
  { key: "balance", header: "Balance", format: "money" },
  { key: "pastDue", header: "Past due", format: "money" },
];

const organizationColumns: ColumnSpec[] = [
  { key: "name", header: "Name", format: "link" },
  { key: "industry", header: "Industry", format: "text" },
  {
    key: "networkStatus",
    header: "Network status",
    format: "status",
    accessor: (row) => capitalise(String(row.networkStatus)),
  },
  { key: "facet", header: "Facet", format: "badge" },
];

const contactColumns: ColumnSpec[] = [
  { key: "name", header: "Name", format: "link" },
  { key: "title", header: "Title", format: "text" },
  { key: "email", header: "Email", format: "text" },
  { key: "phone", header: "Phone", format: "text" },
  { key: "createdAt", header: "Created", format: "date" },
];

const accountsSegment: TabSegment<PartyDetail> = {
  key: "accounts",
  label: "Accounts",
  content: {
    kind: "table",
    columns: accountColumns,
    rows: (d) => d.accounts,
    empty: empty("No accounts", "Linked accounts will appear here."),
  },
};

const tabsFor = (kind: Kind): TabSpec<PartyDetail>[] => [
  {
    key: "activity",
    label: "Activity",
    segments: [
      {
        key: "timeline",
        label: "Timeline",
        content: {
          kind: "timeline",
          events: (d) => d.timeline,
          empty: empty(
            "No activity yet",
            "Invoices, payments, tickets and calls will appear here.",
          ),
        },
      },
    ],
  },
  {
    key: "billing",
    label: "Billing",
    segments: [
      {
        key: "invoices",
        label: (t) => t.billingTab,
        content: {
          kind: "table",
          columns: invoiceColumns,
          rows: (d) => d.invoices,
          empty: empty("No invoices", "Billed documents will appear here."),
          rowActions: [
            { label: "Preview", icon: FileText, gap: "pdf-preview" },
          ],
        },
      },
      {
        key: "payments",
        label: (t) => t.payments,
        content: {
          kind: "table",
          columns: paymentColumns,
          rows: (d) => d.payments,
          empty: empty("No payments", "Received payments will appear here."),
        },
      },
    ],
  },
  {
    key: "support",
    label: "Support",
    segments: [
      {
        key: "tickets",
        label: (t) => t.tickets,
        content: {
          kind: "table",
          columns: ticketColumns,
          rows: (d) => d.tickets,
          empty: empty("No requests", "Support requests will appear here."),
        },
      },
      {
        key: "interactions",
        label: "Interactions",
        content: {
          kind: "table",
          columns: interactionColumns,
          rows: (d) => d.interactions,
          empty: empty(
            "No interactions",
            "Calls and messages will appear here.",
          ),
        },
      },
    ],
  },
  {
    key: "relationships",
    label: "Relationships",
    segments:
      kind === "contact"
        ? [
            {
              key: "organization",
              label: (t) => t.organization,
              content: {
                kind: "table",
                columns: organizationColumns,
                rows: (d, t) =>
                  d.organizations.map((o) => ({
                    ...o,
                    facet: t(orgFacetTerm(o.facet)),
                  })),
                empty: empty(
                  "No organization",
                  "This record is not linked to an organization.",
                ),
              },
            },
            accountsSegment,
          ]
        : [
            {
              key: "contacts",
              label: (t) => t.contacts,
              content: {
                kind: "table",
                columns: contactColumns,
                rows: (d) => d.contacts,
                empty: empty("No contacts", "Linked people will appear here."),
              },
            },
            accountsSegment,
          ],
  },
  {
    key: "communications",
    label: "Communications",
    gap: "mailbox",
    segments: [
      {
        key: "messages",
        label: "Messages",
        content: {
          kind: "placeholder",
          gap: "mailbox",
          message:
            "Message history and the composer need a mailbox composition.",
        },
      },
    ],
  },
  {
    key: "notes",
    label: "Notes",
    gap: "rich-text",
    segments: [
      {
        key: "notes",
        label: "Notes",
        content: {
          kind: "placeholder",
          gap: "rich-text",
          message: "Notes and cases need a rich-text editor.",
        },
      },
    ],
  },
];

const summaryFor = (d: PartyDetail, persona: Persona): Field[] => {
  const { account } = d;
  const mailing = d.addresses.find((a) => a.type === "mailing");
  const verified = d.methods.some((m) => m.verified);
  return [
    {
      label: "Accounts",
      value: account.numbers.length ? account.numbers.join(", ") : "Not linked",
      format: "text",
    },
    {
      label: (t) => t.addressCell,
      value: d.row.premiseAddress,
      format: "text",
    },
    {
      label: "Mailing address",
      value: mailing?.line ?? "Same as service",
      format: "text",
    },
    { label: "Account status", value: account.status, format: "status" },
    {
      label: "Delinquency",
      value: account.pastDue > 0 ? "Past due" : "Current",
      format: "status",
      ...(account.pastDue > 0 ? { hint: usd(account.pastDue) } : {}),
    },
    persona.key === "government_federal"
      ? { label: "Risk flags", value: "None", format: "text" }
      : {
          label: "Verification",
          value: verified ? "Verified" : "Not verified",
          format: "status",
        },
  ];
};

export const partyDetailSpec = (
  kind: Kind,
): DetailSpec<PartyRow, PartyDetail> => ({
  key: `${kind}-profile`,
  load: (row, persona) => partyDetail(row, persona),
  header: (d) => {
    const row = d.row;
    const org = isOrganization(row) ? row : null;
    const subtitle = [row.email, row.phone, org ? org.industry : null]
      .filter(Boolean)
      .join(" · ");
    const badges: BadgeSpec[] = [
      { label: d.source, tone: "info" },
      {
        label:
          kind === "organization"
            ? orgFacetTerm(row.facet)
            : facetTerm(row.facet),
      },
    ];
    if (org) {
      badges.push({
        label: networkStatusLabel[org.networkStatus],
        tone: networkTone[org.networkStatus] ?? "neutral",
      });
      if (d.isTenant) badges.push({ label: "Beacon tenant", tone: "info" });
    }
    return {
      title: row.name,
      initials: initialsOf(row.name),
      subtitle,
      badges,
    };
  },
  actions: headerActions,
  menu: menuFor(kind),
  alert: (d, persona) => {
    if (!d.duplicates.length) return null;
    const n = d.duplicates.length;
    const entity = (
      kind === "contact" ? persona.terms.contact : persona.terms.organization
    ).toLowerCase();
    const signals = [...new Set(d.duplicates.map((x) => x.signals))].join(", ");
    const confidence = Math.max(...d.duplicates.map((x) => x.confidence));
    const candidates = d.duplicates
      .map((x) =>
        x.signals === "phone"
          ? `${x.name} · ${x.email} · shares ${d.row.phone}`
          : `${x.name} · ${x.email}`,
      )
      .join("; ");
    return {
      tone: "warning",
      title: `This ${entity} might be the same as ${n} other record${n === 1 ? "" : "s"}`,
      description: `Matched on ${signals} · ${confidence}% confidence · ${candidates}`,
      actions: [
        { label: "Merge", icon: GitMerge, gap: "merge-review" },
        { label: "They're different", icon: X, variant: "ghost" },
      ],
    };
  },
  summary: summaryFor,
  cards,
  tabs: tabsFor(kind),
  gaps: ["ai-insights", "map"],
});
