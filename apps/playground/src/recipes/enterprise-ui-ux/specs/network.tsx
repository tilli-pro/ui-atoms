import {
  Ban,
  Check,
  Download,
  ExternalLink,
  GitMerge,
  Handshake,
  Link2,
  ListFilter,
  Mail,
  Pencil,
  Plus,
  RotateCw,
  Send,
  Share2,
  Trash2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import {
  type ExchangeStatus,
  type InviteStatus,
  type NetworkContact,
  type NetworkDirectoryCompany,
  type NetworkExchange,
  type NetworkInvite,
  type NetworkOrganization,
  type NetworkStatus,
  networkData,
} from "../mock/network.js";
import { contactsShape, organizationsShape } from "../mock/shapes/network.js";
import type {
  ActionSpec,
  ChipSpec,
  ColumnSpec,
  ModuleSpecs,
  Persona,
} from "./types.js";

const includes = (value: string, query: string) =>
  value.toLowerCase().includes(query.trim().toLowerCase());

const capitalise = (value: string) => {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const networkStatusLabel: Record<NetworkStatus, string> = {
  connected: "Connected",
  invited: "Invited",
  not_invited: "Not invited",
};

const exchangeStatusLabel: Record<ExchangeStatus, string> = {
  transport_delivered: "Awaiting review",
  business_accepted: "Completed",
  rejected: "Rejected",
  expired: "Expired",
  dead_letter: "Dead letter",
};

const inviteStatusLabel: Record<InviteStatus, string> = {
  created: "Invited",
  sent: "Invited",
  viewed: "Viewed",
  authenticated: "Signing up",
  claimed: "Partner claimed",
  expired: "Expired",
  revoked: "Revoked",
  declined: "Declined",
};

const direction = (row: NetworkExchange) =>
  row.direction === "inbound" ? "Inbound" : "Outbound";

const contactTotal = (persona: Persona) => contactsShape.totals[persona.key];
const organizationTotal = (persona: Persona) =>
  organizationsShape.totals[persona.key];

const contactColumns: ColumnSpec<NetworkContact>[] = [
  { key: "name", header: "Name", format: "link", sortable: true },
  { key: "email", header: "Email", format: "text", sortable: true },
  { key: "phone", header: "Phone", format: "text" },
  { key: "accountNumber", header: "Account #", format: "link" },
  { key: "premiseAddress", header: "Premise address", format: "text" },
  {
    key: "balance",
    header: "Balance",
    format: "money",
    align: "end",
    sortable: true,
  },
  { key: "pastDueDate", header: "Past due date", format: "date" },
  { key: "createdAt", header: "Created", format: "date", sortable: true },
];

const organizationColumns: ColumnSpec<NetworkOrganization>[] = [
  { key: "name", header: "Name", format: "link", sortable: true },
  { key: "email", header: "Email", format: "text", sortable: true },
  { key: "phone", header: "Phone", format: "text" },
  { key: "accountNumber", header: "Account #", format: "link" },
  { key: "premiseAddress", header: "Premise address", format: "text" },
  {
    key: "balance",
    header: "Balance",
    format: "money",
    align: "end",
    sortable: true,
  },
  { key: "pastDueDate", header: "Past due date", format: "date" },
  { key: "createdAt", header: "Created", format: "date", sortable: true },
  { key: "classification", header: "Classification", format: "text" },
  { key: "industry", header: "Industry", format: "text", sortable: true },
  {
    key: "networkStatus",
    header: "Network status",
    format: "status",
    accessor: (row) => networkStatusLabel[row.networkStatus],
  },
];

const directoryColumns: ColumnSpec<NetworkDirectoryCompany>[] = [
  {
    key: "displayName",
    header: "Display name",
    format: "party",
    sortable: true,
    accessor: (row) =>
      row.isMine
        ? { name: row.displayName, subline: "This is your company" }
        : row.displayName,
  },
  { key: "legalName", header: "Legal name", format: "text" },
  { key: "industry", header: "Industry", format: "text" },
  { key: "region", header: "Region", format: "text" },
  { key: "tradesWith", header: "Trades with", format: "count" },
  { key: "joinedAt", header: "Joined", format: "date", sortable: true },
];

const exchangeColumns: ColumnSpec<NetworkExchange>[] = [
  {
    key: "direction",
    header: "Direction",
    format: "badge",
    accessor: direction,
  },
  {
    key: "documentType",
    header: "Document type",
    format: "text",
    accessor: (row) => capitalise(row.documentType),
  },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => exchangeStatusLabel[row.status],
  },
  { key: "partner", header: "Partner", format: "text" },
  { key: "createdAt", header: "Created", format: "date", sortable: true },
];

const inviteColumns: ColumnSpec<NetworkInvite>[] = [
  { key: "recipient", header: "Recipient", format: "text" },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => inviteStatusLabel[row.status],
  },
  {
    key: "payment",
    header: "Payment",
    format: "text",
    accessor: (row) => (row.payment === "paid" ? "Paid" : null),
  },
  { key: "sentAt", header: "Sent", format: "date", sortable: true },
];

const contactChips: ChipSpec<NetworkContact>[] = [
  {
    key: "customer",
    label: (t) => t.personCustomer,
    predicate: (row) => row.facet === "customer",
  },
  {
    key: "vendor",
    label: (t) => t.personVendor,
    predicate: (row) => row.facet === "vendor",
  },
  {
    key: "employee",
    label: (t) => t.personEmployee,
    predicate: (row) => row.facet === "employee",
  },
];

const organizationChips: ChipSpec<NetworkOrganization>[] = [
  {
    key: "commercial",
    label: (t) => t.orgCustomer,
    predicate: (row) => row.facet === "commercial",
  },
  {
    key: "vendor",
    label: (t) => t.orgVendor,
    predicate: (row) => row.facet === "vendor",
  },
  {
    key: "internal",
    label: (t) => t.orgEmployee,
    predicate: (row) => row.facet === "internal",
  },
];

const exchangeChips: ChipSpec<NetworkExchange>[] = [
  {
    key: "inbound",
    label: "Inbox",
    predicate: (row) => row.direction === "inbound",
  },
  {
    key: "outbound",
    label: "Outbox",
    predicate: (row) => row.direction === "outbound",
  },
];

const inviteChips: ChipSpec<NetworkInvite>[] = [
  {
    key: "pending",
    label: "Pending",
    predicate: (row) =>
      ["created", "sent", "viewed", "authenticated"].includes(row.status),
  },
  {
    key: "claimed",
    label: "Claimed",
    predicate: (row) => row.status === "claimed",
  },
  {
    key: "expired",
    label: "Expired",
    predicate: (row) => row.status === "expired",
  },
  {
    key: "revoked",
    label: "Revoked",
    predicate: (row) => row.status === "revoked",
  },
  {
    key: "declined",
    label: "Declined",
    predicate: (row) => row.status === "declined",
  },
];

const partyPageActions = (create: ActionSpec): ActionSpec[] => [
  { label: "Import", icon: Upload, variant: "outline", gap: "file-import" },
  { label: "Export", icon: Download, variant: "outline" },
  {
    label: "Filters",
    icon: ListFilter,
    variant: "outline",
    gap: "filter-builder",
  },
  create,
];

const exchangeSearch = (row: Record<string, unknown>, query: string) =>
  ["partner", "recipient", "documentType"].some((key) => {
    const value = row[key];
    return typeof value === "string" && includes(value, query);
  });

const count = <T,>(rows: T[], test: (row: T) => boolean) =>
  rows.filter(test).length;

export const networkSpecs: ModuleSpecs = {
  items: {
    contacts: {
      key: "contacts",
      title: (t) => t.contacts,
      description: "Every person you deal with.",
      rows: (persona) => networkData(persona).contacts,
      total: contactTotal,
      columns: contactColumns,
      chips: contactChips,
      selectable: true,
      gaps: ["filter-builder"],
      rowActions: [
        { label: "Edit", icon: Pencil },
        { label: "Link or merge", icon: GitMerge },
        { label: "Delete", icon: Trash2, variant: "destructive" },
      ],
      pageActions: partyPageActions({
        label: (t) => t.createContact,
        icon: Plus,
      }),
      search: (row: NetworkContact, query) =>
        includes(row.name, query) || includes(row.email, query),
      empty: {
        title: (t) => `No ${t.contacts.toLowerCase()} yet`,
        description: (t) =>
          `Get started by adding your first ${t.contact.toLowerCase()} or importing from a CSV file.`,
      },
    },
    organizations: {
      key: "organizations",
      title: (t) => t.organizations,
      description: "Every organization you deal with, and how connected it is.",
      rows: (persona) => networkData(persona).organizations,
      total: organizationTotal,
      columns: organizationColumns,
      chips: organizationChips,
      selects: [
        {
          key: "networkStatus",
          label: "network statuses",
          options: (["connected", "invited", "not_invited"] as const).map(
            (status) => ({
              value: status,
              label: networkStatusLabel[status],
              predicate: (row: NetworkOrganization) =>
                row.networkStatus === status,
            }),
          ),
        },
      ],
      selectable: true,
      gaps: ["filter-builder"],
      rowActions: [
        { label: "Edit", icon: Pencil },
        { label: "Link or merge", icon: GitMerge },
        { label: "Delete", icon: Trash2, variant: "destructive" },
        { label: "Invite", icon: UserPlus },
        { label: "Re-invite", icon: RotateCw },
        { label: "Manage", icon: Handshake },
      ],
      pageActions: [
        ...partyPageActions({
          label: (t) => t.createOrganization,
          icon: Plus,
        }),
        { label: "Invite by email", icon: Mail, variant: "outline" },
        { label: "Invite all", icon: Send, variant: "outline" },
        { label: "Bring your book", icon: Link2, variant: "outline" },
      ],
      search: (row: NetworkOrganization, query) =>
        includes(row.name, query) || includes(row.email, query),
      empty: {
        title: (t) => `No ${t.organizations.toLowerCase()} yet`,
        description: (t) =>
          `Get started by adding your first ${t.organization.toLowerCase()}.`,
      },
    },
    directory: {
      key: "directory",
      title: "Directory",
      description: "Companies listed on the Beacon network.",
      rows: (persona) => networkData(persona).directory,
      columns: directoryColumns,
      chips: [],
      rowActions: [
        { label: "Connect", icon: Handshake },
        { label: "Open profile", icon: ExternalLink },
      ],
      pageActions: [],
      search: (row: NetworkDirectoryCompany, query) =>
        includes(row.displayName, query) || includes(row.legalName, query),
      empty: {
        title: "No companies match your search.",
        description: "Try a different name, industry or region.",
      },
    },
    activity: {
      key: "activity",
      title: "Activity",
      description: "Documents exchanged with your partners, and invites sent.",
      rows: (persona) => networkData(persona).exchanges,
      columns: exchangeColumns,
      chips: exchangeChips,
      rowActions: [
        { label: "Accept", icon: Check },
        { label: "Reject", icon: X, variant: "destructive" },
        { label: "Open", icon: ExternalLink },
        { label: "Resend", icon: RotateCw },
        { label: "Revoke", icon: Ban, variant: "destructive" },
      ],
      pageActions: [
        { label: "Send to external email", icon: Mail, variant: "outline" },
        { label: "Attach an invoice", icon: Plus, variant: "outline" },
        { label: "Share document", icon: Share2, variant: "outline" },
      ],
      search: exchangeSearch,
      empty: {
        title: "No exchanges found",
        description: "Documents you send or receive will appear here.",
      },
      segments: [
        {
          key: "exchanges",
          label: "Exchanges",
          rows: (persona) => networkData(persona).exchanges,
          columns: exchangeColumns,
          chips: exchangeChips,
          selects: [
            {
              key: "status",
              label: "statuses",
              options: (
                Object.keys(exchangeStatusLabel) as ExchangeStatus[]
              ).map((status) => ({
                value: status,
                label: exchangeStatusLabel[status],
                predicate: (row: NetworkExchange) => row.status === status,
              })),
            },
          ],
          empty: {
            title: "No exchanges found",
            description: "Documents you send or receive will appear here.",
          },
        },
        {
          key: "invites",
          label: "Invites",
          rows: (persona) => networkData(persona).invites,
          columns: inviteColumns,
          chips: inviteChips,
          empty: {
            title: "No invites sent yet",
            description: "Invites to partners outside the network appear here.",
          },
        },
      ],
    },
  },
  dashboard: (persona) => {
    const data = networkData(persona);
    const awaiting = count(
      data.exchanges,
      (row) =>
        row.direction === "inbound" && row.status === "transport_delivered",
    );
    const statusCounts = (
      Object.keys(exchangeStatusLabel) as ExchangeStatus[]
    ).map((status) => ({
      status,
      n: count(data.exchanges, (row) => row.status === status),
    }));
    return {
      stats: [
        {
          label: (t) => t.organizations,
          value: organizationTotal(persona),
          hint: "In your book",
        },
        {
          label: (t) => t.contacts,
          value: contactTotal(persona),
          hint: "In your book",
        },
        {
          label: "Connected on Enterprise",
          value: count(
            data.organizations,
            (row) => row.networkStatus === "connected",
          ),
          hint: "Exchanging documents",
        },
        {
          label: "Pending invites",
          value: count(
            data.organizations,
            (row) => row.networkStatus === "invited",
          ),
          hint: "Waiting on a reply",
        },
        {
          label: "Exchanges awaiting review",
          value: awaiting,
          hint: "Inbound, to accept or reject",
        },
      ],
      panels: [
        {
          kind: "list",
          title: "Connect requests",
          description: "Organizations you have invited.",
          items: data.organizations
            .filter((row) => row.networkStatus === "invited")
            .slice(0, 5)
            .map((row) => ({
              label: row.name,
              value: "Invited",
              hint: row.email,
            })),
        },
        {
          kind: "table",
          title: "Recent exchanges",
          description: "Newest documents on the network.",
          columns: exchangeColumns as ColumnSpec[],
          rows: data.exchanges.slice(0, 6),
        },
        {
          kind: "list",
          title: "Directory matches",
          description: "Companies on the network you could connect with.",
          items: data.directory
            .filter((row) => !row.isMine)
            .slice(0, 5)
            .map((row) => ({
              label: row.displayName,
              value: row.region,
              hint: row.industry,
            })),
        },
        {
          kind: "meters",
          title: "Network pulse",
          description: "Exchanges by status.",
          gap: "charts",
          meters: statusCounts.map(({ status, n }) => ({
            label: exchangeStatusLabel[status],
            value: n,
            max: data.exchanges.length,
            display: String(n),
          })),
        },
      ],
    };
  },
};
