import {
  byDateAsc,
  numberRange,
  plusDays,
  tenantOf,
  weights,
} from "../finance/common.js";
import {
  emailFor,
  organizationsByIndustry,
  personName,
  phone,
  staffNames,
} from "../names.js";
import { ANCHOR, createRng, seedFor } from "../random.js";
import {
  audiencesShape,
  campaignsShape,
  sentShape,
  templatesShape,
} from "../shapes/engage.js";
import { between, COUNTS, lookup, pickMany, uniqueNames } from "./common.js";
import type { Persona } from "../../specs/types.js";
import type { SourceTenant } from "../shapes/types.js";
import type {
  AudienceStatus,
  CampaignChannel,
  CampaignStatus,
  EngageAudience,
  EngageCampaign,
  EngageSent,
  EngageTemplate,
  SentStatus,
  TemplateApproval,
  TemplateChannel,
} from "./types.js";

export const CAMPAIGN_TOPICS = [
  "October bill reminder",
  "Storm readiness update",
  "Meter upgrade outreach",
  "Autopay enrollment",
  "Paperless billing invite",
  "Payment plan offer",
  "Service area notice",
  "Planned maintenance notice",
  "Energy savings tips",
  "Rebate program launch",
  "Customer survey",
  "Account verification",
  "Late payment follow-up",
  "Welcome series",
  "Holiday hours notice",
  "Outage restoration update",
  "Card activation reminder",
  "Statement ready",
  "Fraud alert awareness",
  "Annual notice",
];
export const CAMPAIGN_GROUPS = [
  "Billing cycle",
  "Seasonal readiness",
  "Onboarding",
  "Collections follow-up",
  "Service notices",
];

export const genCampaigns = (persona: Persona): EngageCampaign[] => {
  const rng = createRng(seedFor(persona, "engage.campaigns"));
  const e = campaignsShape.enums;
  const tenant = tenantOf<SourceTenant>(campaignsShape, persona.key);
  const window = campaignsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const size = numberRange(campaignsShape, "audience_size");
  const names = uniqueNames(
    rng,
    CAMPAIGN_TOPICS,
    ["", " - second wave", " - reminder"],
    COUNTS.campaigns,
  );
  const rows = names.map((name, i): EngageCampaign => {
    const status = rng.weighted(lookup<CampaignStatus>(e, "status", tenant));
    const channel = rng.weighted(weights<CampaignChannel>(e, "channel"));
    const group =
      rng.weighted(weights<string>(e, "has_group")) === "true"
        ? rng.pick(CAMPAIGN_GROUPS)
        : null;
    const createdAt = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
    const ran =
      status === "completed" || status === "running" || status === "paused";
    const lastRun = ran ? between(rng, plusDays(createdAt, 0.2), ANCHOR) : null;
    const modifiedAt = between(rng, lastRun ?? createdAt, ANCHOR);
    const nextRun = status === "scheduled" ? rng.daysAhead(1, 14) : null;
    let sent = 0;
    let delivered = 0;
    let opened = 0;
    let clicked = 0;
    let failed = 0;
    if (ran) {
      const audience = Math.max(2, Math.round(rng.range(size, 0)));
      sent =
        status === "completed"
          ? audience
          : Math.round(
              audience * rng.range({ min: 0.2, median: 0.5, max: 0.9 }),
            );
      failed = Math.round(
        sent * rng.range({ min: 0.01, median: 0.04, max: 0.12 }),
      );
      delivered = sent - failed;
      if (channel === "email" || channel === "whatsapp") {
        opened = Math.round(
          delivered * rng.range({ min: 0.2, median: 0.38, max: 0.6 }),
        );
        clicked = Math.round(
          opened * rng.range({ min: 0.05, median: 0.15, max: 0.3 }),
        );
      }
    }
    return {
      id: `campaign-${i + 1}`,
      name,
      status,
      channel,
      group,
      lastRun,
      nextRun,
      modifiedAt,
      createdAt,
      sent,
      delivered,
      opened,
      clicked,
      failed,
    };
  });
  return byDateAsc(rows, (r) => r.createdAt).map((r, i) => ({
    ...r,
    id: `campaign-${i + 1}`,
  }));
};

export const AUDIENCE_TOPICS = [
  "Overdue 60+ days accounts",
  "Autopay not enrolled",
  "High balance customers",
  "New customers this quarter",
  "Paperless billing candidates",
  "Residential accounts",
  "Business accounts",
  "Recent payment failures",
  "Senior discount eligible",
  "Open disputes",
  "Service area north",
  "Service area south",
  "Rebate program eligible",
  "Dormant accounts",
  "Payment plan active",
  "Card holders without activation",
  "Large commercial users",
  "Moved in last 30 days",
  "Low usage customers",
  "Past-due with contact on file",
  "Pending reconnection",
  "Enrollment applicants",
];
export const FIELD_LABELS = [
  "Status",
  "Amount paid",
  "Amount due",
  "Customer type",
  "Address",
];
export const REJECTION_REASONS = [
  "Includes accounts without consent",
  "Condition on a restricted field",
  "Audience too broad for this channel",
];

export const genAudiences = (persona: Persona): EngageAudience[] => {
  const rng = createRng(seedFor(persona, "engage.audiences"));
  const window = audiencesShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const names = uniqueNames(
    rng,
    AUDIENCE_TOPICS,
    ["", " - last 90 days"],
    COUNTS.audiences,
  );
  const rows = names.map((name, i): EngageAudience => {
    const status = rng.weighted(
      weights<AudienceStatus>(audiencesShape.enums, "status"),
    );
    const createdAt = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
    const updatedAt = between(rng, createdAt, ANCHOR);
    const version =
      status === "superseded" || status === "archived"
        ? rng.int(2, 4)
        : Math.round(rng.range(numberRange(audiencesShape, "revision")));
    const counted = status !== "draft";
    const reviewed =
      status === "pending_approval" ||
      status === "rejected" ||
      (status === "approved" && rng.bool(0.4));
    return {
      id: `audience-${i + 1}`,
      name,
      status,
      accounts: counted
        ? Math.round(rng.range(numberRange(audiencesShape, "last_count"), 0))
        : 0,
      version,
      fields: pickMany(rng, FIELD_LABELS, rng.int(1, 2)),
      rejectionReason:
        status === "rejected" ? rng.pick(REJECTION_REASONS) : null,
      updatedAt,
      createdAt,
      approvalRequestedBy: reviewed ? rng.pick(staffNames) : null,
    };
  });
  return rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

export const TEMPLATE_BASES: Record<string, readonly string[]> = {
  application: [
    "application_received",
    "application_status_update",
    "application_more_info",
    "application_approved",
  ],
  none: ["general_notice", "welcome_message"],
  service: [
    "service_visit_confirmation",
    "service_request_received",
    "service_completed_notice",
  ],
  agent_action: [
    "agent_callback_request",
    "agent_follow_up",
    "agent_case_summary",
    "agent_handoff_notice",
  ],
  billing: [
    "bill_due_reminder",
    "bill_ready_notice",
    "payment_received_notice",
    "autopay_confirmation",
    "past_due_notice",
  ],
  alert: [
    "outage_alert",
    "storm_readiness_alert",
    "service_interruption_notice",
    "security_alert",
  ],
  account: [
    "account_verification",
    "profile_updated_notice",
    "password_reset_help",
    "contact_details_confirm",
  ],
  marketing: [
    "rebate_promotion",
    "paperless_billing_invite",
    "customer_survey_invite",
  ],
  internal: [
    "internal_escalation_notice",
    "internal_shift_handover",
    "internal_review_request",
  ],
  onboarding: [
    "onboarding_welcome",
    "onboarding_checklist",
    "onboarding_first_bill",
  ],
  program: [
    "program_enrollment_open",
    "program_eligibility_notice",
    "program_renewal_reminder",
    "program_benefit_summary",
  ],
  collections: [
    "collections_first_notice",
    "collections_payment_plan_offer",
    "collections_final_notice",
  ],
};
export const PREVIEW_LINES: Record<string, string> = {
  application:
    "Your application has been received and a reviewer will follow up within five business days.",
  none: "A short update from our team about your account.",
  service:
    "Your service visit is booked. Reply to reschedule or call us for help.",
  agent_action:
    "An agent has a follow-up for you. Reply with a time that suits you.",
  billing: "Your bill is ready and due soon. Pay online to avoid a late fee.",
  alert:
    "We are working on a service interruption in your area and will update you shortly.",
  account: "Please confirm your contact details so we can keep you informed.",
  marketing:
    "You may qualify for a new rebate. See the details and sign up today.",
  internal:
    "Team notice: review the open items in your queue before end of day.",
  onboarding:
    "Welcome aboard. Here are the first steps to set up your account.",
  program:
    "Enrollment for the assistance program is open. Check your eligibility online.",
  collections:
    "Your account has a past due balance. Contact us to set up a payment plan.",
};

export const genTemplates = (persona: Persona): EngageTemplate[] => {
  const rng = createRng(seedFor(persona, "engage.templates"));
  const e = templatesShape.enums;
  const tenant = tenantOf<SourceTenant>(templatesShape, persona.key);
  const window = templatesShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const used = new Set<string>();
  const rows = Array.from(
    { length: COUNTS.templates },
    (_, i): EngageTemplate => {
      const key = rng.weighted(weights<string>(e, "category"));
      const channel = rng.weighted(
        lookup<TemplateChannel>(e, "channel", tenant),
      );
      const drawn = rng.weighted(
        lookup<TemplateApproval>(e, "approval", tenant),
      );
      // QA government has 3 approved of 67; a 60-row sample can miss them, so force 3.
      const approval: TemplateApproval =
        tenant === "G1" && i < 3 ? "approved" : drawn;
      const base = rng.pick(TEMPLATE_BASES[key] ?? TEMPLATE_BASES.none ?? []);
      let name = `${base}_${channel}`;
      for (let n = 2; used.has(name); n++) name = `${base}_${channel}_v${n}`;
      used.add(name);
      const preview = PREVIEW_LINES[key] ?? "";
      return {
        id: `template-${i + 1}`,
        name,
        channel,
        approval,
        category: key === "none" ? null : key,
        system: rng.weighted(weights<string>(e, "system")) === "true",
        updatedAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
        preview:
          channel === "ivr" || channel === "voice"
            ? `Press 1 to hear this message again. ${preview}`
            : preview,
      };
    },
  );
  return rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

export const genSent = (
  persona: Persona,
  campaigns: EngageCampaign[],
): EngageSent[] => {
  const rng = createRng(seedFor(persona, "engage.sent"));
  const e = sentShape.enums;
  const ran = campaigns.filter((c) => c.lastRun !== null);
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: COUNTS.sent }, (_, i): EngageSent => {
    const status = rng.weighted(weights<SentStatus>(e, "status"));
    const person = personName(rng);
    // Pick the campaign first: its sends are never older than the campaign.
    const campaign =
      rng.weighted(weights<string>(e, "campaign")) === "true"
        ? rng.pick(ran.length ? ran : campaigns)
        : null;
    const channel = campaign
      ? campaign.channel
      : rng.weighted(weights<CampaignChannel>(e, "channel"));
    // Skewed recent so the Today preset has rows.
    const roll = rng.next();
    const drawnAt =
      roll < 0.2
        ? rng.daysAgo(0, 0)
        : roll < 0.55
          ? rng.daysAgo(1, 6)
          : roll < 0.85
            ? rng.daysAgo(7, 29)
            : rng.daysAgo(30, 90);
    const createdAt = campaign
      ? between(rng, campaign.lastRun ?? campaign.createdAt, ANCHOR)
      : drawnAt;
    const sentAt =
      status === "pending"
        ? null
        : between(rng, createdAt, plusDays(createdAt, 0.04));
    return {
      id: `sent-${i + 1}`,
      channel,
      recipient: person,
      recipientDetail:
        channel === "email" ? emailFor(person, rng.pick(orgs)) : phone(rng),
      name: campaign ? campaign.name : null,
      status,
      sentAt,
      createdAt,
    };
  });
  return rows
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((r, i) => ({ ...r, id: `sent-${i + 1}` }));
};
