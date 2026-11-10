import {
  Archive,
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  Globe,
  Megaphone,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Send,
  Undo2,
  Users,
  X,
} from "lucide-react";
import {
  type CampaignStatus,
  type EngageAudience,
  type EngageCampaign,
  type EngageForm,
  type EngagePlatformStat,
  type EngagePost,
  type EngageSent,
  type EngageSubmission,
  type EngageTemplate,
  engageData,
  type FormStatus,
  type PostStatus,
  type SentStatus,
  type SubmissionStatus,
  type TemplateApproval,
  type TemplateChannel,
} from "../mock/engage.js";
import { ANCHOR } from "../mock/random.js";
import {
  type AnyList,
  capitalise,
  DAY,
  empty,
  lead,
  sameDay,
  searchBy,
  statusChips,
} from "./common.js";
import type {
  ColumnSpec,
  ListSpec,
  ModuleSpecs,
  Persona,
  SegmentSpec,
  SelectFilterSpec,
} from "./types.js";

const adjustFilter = "Try adjusting your search or filter.";
const adjustSearch = "Try adjusting your search criteria.";

const channelLabels: Record<TemplateChannel, string> = {
  email: "Email",
  sms: "SMS",
  ivr: "IVR",
  whatsapp: "WhatsApp",
  voice: "Voice",
};

const channelColumn = <R extends { channel: TemplateChannel }>(): ColumnSpec<
  R & { id: string }
> => ({
  key: "channel",
  header: "Channel",
  format: "badge",
  accessor: (row) => channelLabels[row.channel],
  sortable: false,
});

const channelSelect = <R extends { channel: TemplateChannel }>(
  channels: TemplateChannel[],
): SelectFilterSpec<R & { id: string }> => ({
  key: "channel",
  label: "channels",
  options: channels.map((channel) => ({
    value: channel,
    label: channelLabels[channel],
    predicate: (row) => row.channel === channel,
  })),
});

const statusColumn = <R extends { status: string }>(
  header = "Status",
): ColumnSpec<R & { id: string }> => ({
  key: "status",
  header,
  format: "status",
  accessor: (row) => capitalise(row.status),
  sortable: false,
});

const truncate = (value: string, length: number) =>
  value.length > length ? `${value.slice(0, length - 1).trimEnd()}…` : value;

/* ------------------------------------------------------------ Campaigns */

const campaignStatuses: CampaignStatus[] = [
  "draft",
  "scheduled",
  "running",
  "paused",
  "completed",
];

const campaignsSpec: ListSpec<EngageCampaign> = {
  key: "campaigns",
  title: "Campaigns",
  description: "Reach an audience over Email, SMS, IVR or WhatsApp.",
  rows: (persona) => engageData(persona).campaigns,
  total: (persona) => engageData(persona).totals.campaigns,
  selectable: false,
  columns: [
    { key: "name", header: "Campaign", format: "link", sortable: false },
    statusColumn<EngageCampaign>(),
    channelColumn<EngageCampaign>(),
    {
      key: "group",
      header: "Group",
      format: "text",
      accessor: (row) => row.group ?? "No group",
      sortable: false,
    },
    {
      key: "lastRun",
      header: "Last run",
      format: "datetime",
      accessor: (row) => row.lastRun,
      sortable: false,
    },
    {
      key: "nextRun",
      header: "Next run",
      format: "datetime",
      accessor: (row) => row.nextRun,
      sortable: false,
    },
    {
      key: "modifiedAt",
      header: "Modified",
      format: "datetime",
      sortable: false,
    },
  ],
  chips: statusChips<EngageCampaign>(campaignStatuses),
  selects: [channelSelect<EngageCampaign>(["email", "sms", "ivr", "whatsapp"])],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Run now", icon: Play },
    // The IVR flow builder applies to IVR rows only; a per-row gap is not expressible.
    { label: "Edit", icon: Pencil, gap: "flow-builder" },
    { label: "Archive", icon: Archive },
  ],
  pageActions: [
    { label: "Audiences", icon: Users, variant: "outline" },
    { label: "New campaign", icon: Plus },
  ],
  search: searchBy("name", "group"),
  empty: empty(
    "No campaigns yet",
    "Create your first campaign to reach an audience over Email, SMS, IVR or WhatsApp.",
  ),
};

/* ------------------------------------------------------------ Audiences */

const audienceStatuses = [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "archived",
  "superseded",
];

const audienceColumns = (approvals: boolean): ColumnSpec<EngageAudience>[] => [
  { key: "name", header: "Audience", format: "link", sortable: false },
  statusColumn<EngageAudience>(),
  {
    key: "accounts",
    header: "Accounts",
    format: "count",
    align: "end",
    sortable: false,
  },
  {
    key: "version",
    header: "Version",
    format: "count",
    align: "end",
    sortable: false,
  },
  { key: "updatedAt", header: "Updated", format: "datetime", sortable: false },
  ...(approvals
    ? [
        {
          key: "approvalRequestedBy",
          header: "Requested by",
          format: "text" as const,
          accessor: (row: EngageAudience) => row.approvalRequestedBy ?? "—",
          sortable: false,
        },
      ]
    : []),
];

const audienceSegment = (
  key: string,
  label: string,
  filter: (row: EngageAudience) => boolean,
  emptyCopy: ReturnType<typeof empty>,
): SegmentSpec<EngageAudience> => ({
  key,
  label,
  rows: (persona) => engageData(persona).audiences.filter(filter),
  columns: audienceColumns(key === "approvals"),
  // Every approvals row is pending, so status chips would only ever show one value.
  chips:
    key === "approvals" ? [] : statusChips<EngageAudience>(audienceStatuses),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Approve", icon: Check },
    { label: "Reject", icon: X, variant: "destructive" },
    { label: "New version", icon: FilePlus2 },
  ],
  empty: emptyCopy,
});

const audiencesAll = {
  ...audienceSegment(
    "audiences",
    "Audiences",
    () => true,
    empty(
      "No saved audiences yet",
      "Build an audience once from approved fields, get it approved, and reuse it in any campaign.",
    ),
  ),
  total: (persona: Persona) => engageData(persona).totals.audiences,
};

const isPendingApproval = (row: EngageAudience) =>
  row.status === "pending_approval";

const audiencesApprovals: SegmentSpec<EngageAudience> = {
  ...audienceSegment(
    "approvals",
    "Approvals",
    isPendingApproval,
    empty(
      "Nothing to approve",
      "When someone submits an audience that your policy says needs review, it waits here.",
    ),
  ),
  total: (persona) =>
    engageData(persona).audiences.filter(isPendingApproval).length,
};

const audiencesSpec: AnyList = {
  key: "audiences",
  title: "Audiences",
  description: "Saved audiences and the approvals they wait on.",
  ...lead(audiencesAll),
  segments: [audiencesAll, audiencesApprovals],
  pageActions: [{ label: "New audience", icon: Plus, gap: "filter-builder" }],
  search: searchBy("name"),
  empty: empty("No audiences match.", adjustSearch),
};

/* ------------------------------------------------------------ Templates */

const approvalValues: TemplateApproval[] = ["approved", "pending", "rejected"];

const templatesSpec: ListSpec<EngageTemplate> = {
  key: "templates",
  title: "Templates",
  description: "Message templates for every channel.",
  rows: (persona) => engageData(persona).templates,
  total: (persona) => engageData(persona).totals.templates,
  selectable: false,
  columns: [
    channelColumn<EngageTemplate>(),
    { key: "name", header: "Name", format: "text", sortable: false },
    { key: "preview", header: "Preview", format: "text", sortable: false },
    {
      key: "approval",
      header: "Approval",
      format: "status",
      accessor: (row) => capitalise(row.approval),
      sortable: false,
    },
    {
      key: "category",
      header: "Category",
      format: "text",
      accessor: (row) => row.category ?? "—",
      sortable: false,
    },
    { key: "system", header: "System", format: "boolean", sortable: false },
    {
      key: "updatedAt",
      header: "Updated",
      format: "datetime",
      sortable: false,
    },
  ],
  chips: (["email", "sms", "ivr", "whatsapp", "voice"] as const).map(
    (channel) => ({
      key: channel,
      label: channelLabels[channel],
      predicate: (row: EngageTemplate) => row.channel === channel,
    }),
  ),
  selects: [
    {
      key: "approval",
      label: "approvals",
      options: approvalValues.map((approval) => ({
        value: approval,
        label: capitalise(approval),
        predicate: (row: EngageTemplate) => row.approval === approval,
      })),
    },
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Edit", icon: Pencil, gap: "rich-text" },
    { label: "Approve", icon: Check },
  ],
  pageActions: [{ label: "New", icon: Plus, gap: "rich-text" }],
  search: searchBy("name", "preview"),
  empty: empty(
    "No templates found",
    "Try changing your search or create a new template.",
  ),
};

/* ----------------------------------------------------------------- Sent */

const sentStatuses: SentStatus[] = [
  "sent",
  "delivered",
  "opened",
  "failed",
  "pending",
];

const sentWithin = (days: number | "today") => (row: EngageSent) =>
  days === "today"
    ? sameDay(row.createdAt, ANCHOR)
    : ANCHOR.getTime() - row.createdAt.getTime() <= days * DAY;

const sentSpec: ListSpec<EngageSent> = {
  key: "sent",
  title: "Sent",
  description: "Outbound messages across every channel.",
  rows: (persona) => engageData(persona).sent,
  total: (persona) => engageData(persona).totals.sent,
  selectable: false,
  columns: [
    channelColumn<EngageSent>(),
    {
      key: "recipient",
      header: "Recipient",
      format: "party",
      accessor: (row) => ({
        name: row.recipient,
        subline: row.recipientDetail,
      }),
      sortable: false,
    },
    {
      key: "sentAt",
      header: "Time",
      format: "datetime",
      accessor: (row) => row.sentAt,
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      format: "text",
      accessor: (row) => row.name ?? "—",
      sortable: false,
    },
    statusColumn<EngageSent>(),
  ],
  chips: statusChips<EngageSent>(sentStatuses),
  selects: [
    {
      key: "period",
      label: "dates",
      options: [
        { value: "today", label: "Today", predicate: sentWithin("today") },
        { value: "7d", label: "7 days", predicate: sentWithin(7) },
        { value: "30d", label: "30 days", predicate: sentWithin(30) },
        { value: "90d", label: "90 days", predicate: sentWithin(90) },
      ],
    },
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Resend", icon: RotateCcw },
  ],
  pageActions: [{ label: "Compose", icon: Send, gap: "rich-text" }],
  search: searchBy("recipient", "recipientDetail", "name"),
  empty: empty("No sent messages", "No messages match your filters"),
};

/* ----------------------------------------------------------- Social Hub */

const postStatuses: PostStatus[] = [
  "draft",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "cancelled",
];

const platformLabel = (platform: string) =>
  platform === "twitter" ? "Twitter" : capitalise(platform);

const engagementOf = (row: EngagePost) =>
  row.engagement.likes + row.engagement.comments + row.engagement.shares;

const postApproval = {
  key: "approval",
  header: "Approval",
  format: "status" as const,
  accessor: (row: EngagePost) => capitalise(row.approval),
  sortable: false,
};

const platformSelect: SelectFilterSpec<EngagePost> = {
  key: "platform",
  label: "platforms",
  options: (persona) =>
    engageData(persona).platformStats.map((stat) => ({
      value: stat.platform,
      label: platformLabel(stat.platform),
      predicate: (row: EngagePost) => row.platforms.includes(stat.platform),
    })),
};

const postsSegment: SegmentSpec<EngagePost> = {
  key: "posts",
  label: "Posts",
  rows: (persona) => engageData(persona).posts,
  total: (persona) => engageData(persona).totals.posts,
  columns: [
    {
      key: "body",
      header: "Post",
      format: "party",
      accessor: (row) => ({
        name: truncate(row.body, 60),
        subline: row.platforms.map(platformLabel).join(", "),
      }),
      sortable: false,
    },
    statusColumn<EngagePost>(),
    postApproval,
    {
      key: "scheduledAt",
      header: "Scheduled",
      format: "datetime",
      accessor: (row) => row.scheduledAt,
      sortable: false,
    },
    {
      key: "publishedAt",
      header: "Published",
      format: "datetime",
      accessor: (row) => row.publishedAt,
      sortable: false,
    },
    {
      key: "engagement",
      header: "Engagement",
      format: "count",
      accessor: engagementOf,
      align: "end",
      sortable: false,
    },
    {
      key: "errors",
      header: "Errors",
      format: "text",
      accessor: (row) =>
        row.errors > 0
          ? row.platforms
              .slice(0, row.errors)
              .map(
                (platform) => `${platformLabel(platform)}: failed to publish`,
              )
              .join("; ")
          : "—",
      sortable: false,
    },
  ],
  chips: statusChips<EngagePost>(postStatuses),
  selects: [platformSelect],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Approve", icon: Check },
    { label: "Reschedule", icon: CalendarClock },
    { label: "Retry", icon: RotateCcw },
  ],
  empty: empty(
    "No posts found",
    "Create your first social media post to get started.",
  ),
};

const scheduledPosts = (persona: Persona) =>
  engageData(persona)
    .posts.filter((row) => row.status === "scheduled" && row.scheduledAt)
    .sort(
      (a, b) =>
        (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0),
    );

const scheduleSegment: SegmentSpec<EngagePost> = {
  key: "schedule",
  label: "Schedule",
  rows: scheduledPosts,
  columns: [
    {
      key: "scheduledAt",
      header: "Scheduled",
      format: "datetime",
      accessor: (row) => row.scheduledAt,
      sortable: false,
    },
    {
      key: "body",
      header: "Post",
      format: "text",
      accessor: (row) => truncate(row.body, 60),
      sortable: false,
    },
    {
      key: "platforms",
      header: "Platforms",
      format: "text",
      accessor: (row) => row.platforms.map(platformLabel).join(", "),
      sortable: false,
    },
    postApproval,
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Reschedule", icon: CalendarClock },
  ],
  chips: [],
  selects: [platformSelect],
  total: (persona) => scheduledPosts(persona).length,
  gaps: ["drag-calendar"],
  empty: empty("No upcoming posts", adjustFilter),
};

const analyticsSegment: SegmentSpec<EngagePlatformStat> = {
  key: "analytics",
  label: "Analytics",
  rows: (persona) => engageData(persona).platformStats,
  total: (persona) => engageData(persona).platformStats.length,
  search: searchBy("platform"),
  columns: [
    {
      key: "platform",
      header: "Platform",
      format: "text",
      accessor: (row) => platformLabel(row.platform),
      sortable: false,
    },
    {
      key: "posts",
      header: "Posts",
      format: "count",
      align: "end",
      sortable: false,
    },
    {
      key: "engagement",
      header: "Engagement",
      format: "count",
      align: "end",
      sortable: false,
    },
    {
      key: "followers",
      header: "Followers",
      format: "count",
      align: "end",
      sortable: false,
    },
  ],
  chips: [],
  selects: [],
  rowActions: [],
  gaps: ["charts"],
  empty: empty("No analytics yet", adjustFilter),
};

const socialHubSpec: AnyList = {
  key: "social-hub",
  title: "Social Hub",
  description: "Plan, publish and measure posts across platforms.",
  ...lead(postsSegment),
  segments: [postsSegment, scheduleSegment, analyticsSegment],
  pageActions: [{ label: "New post", icon: Megaphone, gap: "rich-text" }],
  search: searchBy("body"),
  empty: empty(
    "No posts found",
    "Create your first social media post to get started.",
  ),
};

/* --------------------------------------------------------- Applications */

const formStatuses: FormStatus[] = ["draft", "published", "paused", "archived"];

const formsSegment: SegmentSpec<EngageForm> = {
  key: "forms",
  label: "Application forms",
  rows: (persona) => engageData(persona).forms,
  total: (persona) => engageData(persona).totals.forms,
  columns: [
    { key: "name", header: "Name", format: "link", sortable: false },
    {
      key: "type",
      header: "Type",
      format: "text",
      accessor: (row) => capitalise(row.type),
      sortable: false,
    },
    statusColumn<EngageForm>(),
    {
      key: "submissions",
      header: "Submissions",
      format: "count",
      align: "end",
      sortable: false,
    },
    { key: "createdAt", header: "Created", format: "date", sortable: false },
  ],
  chips: statusChips<EngageForm>(formStatuses),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Edit", icon: Pencil, gap: "flow-builder" },
    { label: "List publicly", icon: Globe },
    { label: "Archive", icon: Archive },
  ],
  empty: empty("No application forms found", adjustFilter),
};

const submissionStatuses: SubmissionStatus[] = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "converted",
  "pending_payment",
  "returned_for_edits",
];

const submissionsSegment: SegmentSpec<EngageSubmission> = {
  key: "submissions",
  label: "Submissions",
  rows: (persona) => engageData(persona).submissions,
  total: (persona) => engageData(persona).totals.submissions,
  columns: [
    {
      key: "applicant",
      header: "Applicant",
      format: "party",
      accessor: (row) => ({
        name: row.applicant,
        ...(row.contact ? { subline: row.contact } : {}),
      }),
      sortable: false,
    },
    { key: "form", header: "Form", format: "text", sortable: false },
    statusColumn<EngageSubmission>(),
    {
      key: "source",
      header: "Source",
      format: "badge",
      accessor: (row) => capitalise(row.source),
      sortable: false,
    },
    {
      key: "submittedAt",
      header: "Submitted",
      format: "datetime",
      sortable: true,
    },
    {
      key: "amountDue",
      header: "Amount due",
      format: "money",
      accessor: (row) => row.amountDue,
      align: "end",
      sortable: false,
    },
  ],
  chips: statusChips<EngageSubmission>(submissionStatuses),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Approve", icon: CheckCircle2 },
    { label: "Return for edits", icon: Undo2 },
  ],
  empty: empty("No submissions found", adjustFilter),
};

const applicationsSpec: AnyList = {
  key: "applications",
  title: "Applications",
  description: "Publish forms and review what applicants submit.",
  ...lead(formsSegment),
  segments: [formsSegment, submissionsSegment],
  selectable: true,
  gaps: ["data-grid"],
  pageActions: [{ label: "New form", icon: Plus, gap: "flow-builder" }],
  search: searchBy("name", "type", "applicant", "form", "contact"),
  empty: empty("No application forms found", adjustFilter),
};

/* ------------------------------------------------------------ Dashboard */

const dashboard = (persona: Persona) => {
  const data = engageData(persona);
  const live = data.campaigns.filter(
    (row) => row.status === "running" || row.status === "scheduled",
  ).length;
  const sentToday = data.sent.filter(
    (row) => row.sentAt !== null && sameDay(row.sentAt, ANCHOR),
  ).length;
  const pendingAudiences = data.audiences.filter(
    (row) => row.status === "pending_approval",
  ).length;
  const published = data.forms.filter((row) => row.status === "published");
  const ran = data.campaigns
    .filter((row) => row.sent > 0)
    .sort((a, b) => b.sent - a.sent)
    .slice(0, 6);
  const recent = data.sent.slice(0, 6).map((row) => ({
    id: row.id,
    recipient: row.recipient,
    name: row.name ?? "—",
    channel: channelLabels[row.channel],
    status: capitalise(row.status),
  }));
  const review = data.templates
    .filter((row) => row.approval === "pending")
    .slice(0, 6)
    .map((row) => ({
      id: row.id,
      name: row.name,
      channel: channelLabels[row.channel],
      category: row.category ?? "—",
      updatedAt: row.updatedAt,
    }));
  return {
    stats: [
      {
        label: "Campaigns live",
        value: live,
        hint: "Running or scheduled",
      },
      {
        label: "Sent today",
        value: sentToday,
        hint: "Messages sent since midnight UTC",
      },
      {
        label: "Delivery rate",
        value: `${data.summary.deliveryRate}%`,
        hint: "Delivered or opened, pending excluded",
      },
      {
        label: "Audiences",
        value: data.audiences.length,
        hint: `${pendingAudiences} pending approval`,
      },
      {
        label: "Forms published",
        value: published.length,
        hint: "Accepting submissions",
      },
    ],
    panels: [
      {
        kind: "meters" as const,
        title: "Campaign performance",
        description: "Delivered against sent for campaigns that have run.",
        gap: "charts" as const,
        meters: ran.map((row) => ({
          label: row.name,
          value: row.delivered,
          max: row.sent,
          display: `${row.delivered} / ${row.sent}`,
        })),
      },
      {
        kind: "table" as const,
        title: "Recent sends",
        description: "The newest outbound messages.",
        columns: [
          { key: "recipient", header: "Recipient", format: "text" as const },
          { key: "name", header: "Name", format: "text" as const },
          { key: "channel", header: "Channel", format: "badge" as const },
          { key: "status", header: "Status", format: "status" as const },
        ],
        rows: recent,
      },
      {
        kind: "table" as const,
        title: "Templates in review",
        description: "Templates waiting for approval.",
        columns: [
          { key: "name", header: "Name", format: "text" as const },
          { key: "channel", header: "Channel", format: "badge" as const },
          { key: "category", header: "Category", format: "text" as const },
          { key: "updatedAt", header: "Updated", format: "datetime" as const },
        ],
        rows: review,
      },
    ],
  };
};

export const engageSpecs: ModuleSpecs = {
  items: {
    campaigns: campaignsSpec,
    audiences: audiencesSpec,
    templates: templatesSpec,
    sent: sentSpec,
    "social-hub": socialHubSpec,
    applications: applicationsSpec,
  },
  dashboard,
};
