import type { Row } from "../../specs/types.js";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "completed";
export type CampaignChannel = "email" | "sms" | "ivr" | "whatsapp";
export type TemplateChannel = CampaignChannel | "voice";
export type TemplateApproval = "approved" | "pending" | "rejected";
export type AudienceStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "archived"
  | "superseded";
export type SentStatus = "sent" | "delivered" | "opened" | "failed" | "pending";
export type PostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "cancelled";
export type FormStatus = "draft" | "published" | "archived" | "paused";
export type SubmissionStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "converted"
  | "pending_payment"
  | "returned_for_edits";

/** outreach_campaigns. Run stats are 0 when the campaign never ran. */
export type EngageCampaign = Row & {
  name: string;
  status: CampaignStatus;
  channel: CampaignChannel;
  /** outreach_campaign_groups name, else null ("No group"). */
  group: string | null;
  /** null renders as "Never run". */
  lastRun: Date | null;
  /** Future, set for scheduled campaigns only; else null. */
  nextRun: Date | null;
  modifiedAt: Date;
  createdAt: Date;
  sent: number;
  delivered: number;
  /** Email and WhatsApp only; else 0. */
  opened: number;
  clicked: number;
  failed: number;
};

/** audience_plans. */
export type EngageAudience = Row & {
  name: string;
  status: AudienceStatus;
  /** last_count; 0 for drafts ("Not counted yet"). */
  accounts: number;
  /** revision. */
  version: number;
  /** Field labels used in the plan conditions (outline chips). */
  fields: string[];
  /** Shown as "Rejected: ..." on rejected plans, else null. */
  rejectionReason: string | null;
  updatedAt: Date;
  createdAt: Date;
  /** Staff name for plans that went through approval, else null. */
  approvalRequestedBy: string | null;
};

/** nudge_templates. */
export type EngageTemplate = Row & {
  /** snake_case key. */
  name: string;
  channel: TemplateChannel;
  approval: TemplateApproval;
  /** null for the uncategorised few. */
  category: string | null;
  /** is_default. */
  system: boolean;
  updatedAt: Date;
  /** One invented line. */
  preview: string;
};

/** outreach_messages, direction outbound. */
export type EngageSent = Row & {
  channel: CampaignChannel;
  recipient: string;
  /** Email address or phone number. */
  recipientDetail: string;
  /** Campaign name or null. */
  name: string | null;
  status: SentStatus;
  /** null when pending (blank time). */
  sentAt: Date | null;
  createdAt: Date;
};

/** social_posts, grouped. */
export type EngagePostEngagement = {
  likes: number;
  comments: number;
  shares: number;
};
export type EngagePost = Row & {
  /** Invented, at most 140 characters. */
  body: string;
  status: PostStatus;
  approval: TemplateApproval;
  /** Appendix platform names: linkedin, twitter, facebook, instagram, pinterest, youtube, tiktok, snapchat. */
  platforms: string[];
  /** Future for scheduled posts; also set on some drafts (planned for), failed and published rows. */
  scheduledAt: Date | null;
  publishedAt: Date | null;
  /** Zeros unless published. */
  engagement: EngagePostEngagement;
  link: string | null;
  /** last_error count: 1 to 3 on failed posts, else 0. */
  errors: number;
};

/** application_forms. */
export type EngageForm = Row & {
  name: string;
  type: string;
  status: FormStatus;
  /** total_submissions (live count, independent of the submissions row set). */
  submissions: number;
  approved: number;
  rejected: number;
  /** Outline "listed" badge on published forms. */
  listedPublic: boolean;
  createdAt: Date;
  /** Set on published and paused forms. */
  publicUrl: string | null;
};

/** application_submissions. */
export type EngageSubmission = Row & {
  /** Person, organization or "Anonymous #XXXXXXXX". */
  applicant: string;
  /** Subline: email, else null. */
  email: string | null;
  formId: string;
  /** A form name. */
  form: string;
  /** Phone, null renders as an em dash. */
  contact: string | null;
  status: SubmissionStatus;
  /** "web (direct)", "web" or "invitation". */
  source: string;
  submittedAt: Date;
  /** Set on pending_payment rows only. */
  amountDue: number | null;
};

/** Derived per-platform KPIs for Social analytics. */
export type EngagePlatformStat = Row & {
  platform: string;
  posts: number;
  engagement: number;
  followers: number;
};

export type EngageRowSet =
  | "campaigns"
  | "audiences"
  | "templates"
  | "sent"
  | "posts"
  | "forms"
  | "submissions";

export type EngageData = {
  campaigns: EngageCampaign[];
  audiences: EngageAudience[];
  templates: EngageTemplate[];
  /** Newest first. */
  sent: EngageSent[];
  posts: EngagePost[];
  forms: EngageForm[];
  submissions: EngageSubmission[];
  platformStats: EngagePlatformStat[];
  /** Dashboard figures derived from the row sets. */
  summary: {
    /** Running plus scheduled campaigns. */
    campaignsLive: number;
    /** Sent rows with createdAt on the anchor day. */
    sentToday: number;
    /** Percent (0 to 100, one decimal): delivered or opened share of non-pending sends. */
    deliveryRate: number;
    audiences: number;
    audiencesPendingApproval: number;
    formsPublished: number;
    templatesInReview: number;
    scheduledPosts: number;
    pendingPaymentSubmissions: number;
    /** Sums over campaign run stats. */
    performance: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      failed: number;
    };
  };
  totals: Record<EngageRowSet, number>;
};
