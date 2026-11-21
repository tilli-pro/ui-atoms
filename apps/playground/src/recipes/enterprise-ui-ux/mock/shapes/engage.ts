import type { TableShape } from "./types.js";

/** Aggregates profiled from the Engage section of the module maps appendix. */

export const campaignsShape: TableShape = {
  table: "outreach_campaigns",
  // QA: 48 rows overall (the map said 52); personas u/f/g = 0/16/5.
  totals: { utilities: 0, financial: 16, government_federal: 5 },
  source: {
    // Utilities has no campaigns in QA: borrow the financial shape.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // F1: completed 9, draft 5, scheduled 2; running and paused are appendix vocabulary with no QA rows (synthetic).
    status: [
      ["completed", 9],
      ["draft", 5],
      ["scheduled", 2],
      ["running", 2],
      ["paused", 1],
    ],
    // G1: scheduled 3, draft 1, completed 1 (plus the same synthetic running and paused).
    status_G1: [
      ["scheduled", 3],
      ["draft", 1],
      ["completed", 1],
      ["running", 1],
      ["paused", 1],
    ],
    // QA: email 14, sms 2. ivr and whatsapp are appendix chips with no rows (synthetic), order Email, SMS, IVR, WhatsApp.
    channel: [
      ["email", 14],
      ["sms", 4],
      ["ivr", 3],
      ["whatsapp", 3],
    ],
    // QA: nudge_group_id set on 1 row, group_id never; the mock invents a share so the Group badge shows.
    has_group: [
      ["true", 3],
      ["false", 7],
    ],
  },
  numbers: {
    // outreach_campaign_runs matched_count 2/344/2257 (all personas).
    audience_size: { min: 2, median: 344, max: 2257 },
  },
  // created_at 2026-10-13..2026-11-06 (financial), updated_at the same range.
  dates: { fromDaysAgo: 4, toDaysAgo: 28 },
};

export const audiencesShape: TableShape = {
  table: "audience_plans",
  totals: { utilities: 0, financial: 3, government_federal: 2 },
  source: {
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // QA: approved 5 of 5, all revision 1; the other statuses are appendix vocabulary with no rows (synthetic) so the Approvals segment has content.
    status: [
      ["approved", 50],
      ["pending_approval", 20],
      ["draft", 14],
      ["rejected", 7],
      ["archived", 5],
      ["superseded", 4],
    ],
  },
  numbers: {
    // last_count 0/606/2266.
    last_count: { min: 0, median: 606, max: 2266 },
    // revision is 1/1/1 in QA; the mock invents later revisions for superseded and re-submitted plans.
    revision: { min: 1, median: 1, max: 4 },
  },
  // audience_plans 2026-10-26..2026-11-06.
  dates: { fromDaysAgo: 4, toDaysAgo: 15 },
};

export const templatesShape: TableShape = {
  table: "nudge_templates",
  // Total (all, incl. soft-deleted): utilities 81, financial 71, government 67.
  totals: { utilities: 81, financial: 71, government_federal: 67 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // Active, not deleted, utilities.
    channel_U1: [
      ["email", 44],
      ["sms", 22],
      ["whatsapp", 3],
      ["voice", 1],
    ],
    channel_F1: [
      ["email", 38],
      ["sms", 18],
      ["whatsapp", 6],
      ["ivr", 1],
    ],
    channel_G1: [
      ["email", 33],
      ["sms", 20],
      ["ivr", 7],
      ["voice", 4],
      ["whatsapp", 3],
    ],
    // Verifier: utilities 65 approved of 70 active; government 3 approved, 64 of 67 unapproved; financial 56 of 63. Rejected is synthetic (1 to 6 per persona).
    approval_U1: [
      ["approved", 65],
      ["pending", 4],
      ["rejected", 1],
    ],
    approval_F1: [
      ["approved", 56],
      ["pending", 6],
      ["rejected", 1],
    ],
    approval_G1: [
      ["approved", 3],
      ["pending", 58],
      ["rejected", 6],
    ],
    // Verifier top categories (utilities counts); "none" is the null category (2).
    category: [
      ["application", 10],
      ["none", 2],
      ["service", 7],
      ["agent_action", 8],
      ["billing", 10],
      ["alert", 8],
      ["account", 4],
      ["marketing", 3],
      ["internal", 3],
      ["onboarding", 3],
      ["program", 7],
      ["collections", 4],
    ],
    // is_default true 68, false 2 (utilities).
    system: [
      ["true", 68],
      ["false", 2],
    ],
  },
  // created_at 2026-06-22..2026-10-19 (utilities).
  dates: { fromDaysAgo: 22, toDaysAgo: 141 },
};

export const sentShape: TableShape = {
  table: "outreach_messages (direction = outbound)",
  // Live outbound counts (direction = outbound): u/f/g 3314/14226/7519. The appendix defines Sent as all outbound rows; 14,650 of 25,059 is only the campaign-name share.
  totals: { utilities: 3314, financial: 14226, government_federal: 7519 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // QA channel is email 14193, whatsapp 27, sms 6; the mock widens it (synthetic) so the channel pills have content.
    channel: [
      ["email", 80],
      ["sms", 12],
      ["whatsapp", 6],
      ["ivr", 2],
    ],
    // status (all 3 personas) sent 8498, failed 8304, delivered 4501, pending 3718, opened 38. Never "created" (verifier).
    status: [
      ["sent", 8498],
      ["failed", 8304],
      ["delivered", 4501],
      ["pending", 3718],
      ["opened", 38],
    ],
    // 14,650 of 25,059 persona rows are campaign sends (the rest have no campaign name).
    campaign: [
      ["true", 14650],
      ["false", 10409],
    ],
  },
  // Financial created_at 2026-07-11..2026-11-09; about 50 rows on the latest day and 1,632 in the last 7 days; the mock skews recent so Today has rows.
  dates: { fromDaysAgo: 0, toDaysAgo: 90 },
};

export const postsShape: TableShape = {
  table: "social_posts",
  totals: { utilities: 11, financial: 51, government_federal: 107 },
  source: {
    // Utilities has facebook only (10 draft, 1 failed): borrow the financial platforms.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // G1: published 56, draft 28, failed 19, cancelled 4. Scheduled and publishing have no QA rows in the persona window (synthetic: scheduled rows are generated separately so the Schedule segment has content).
    status: [
      ["published", 56],
      ["draft", 28],
      ["failed", 19],
      ["cancelled", 4],
      ["publishing", 2],
    ],
    // G1 platforms (8). Financial lacks snapchat.
    platform_G1: [
      ["linkedin", 21],
      ["twitter", 19],
      ["facebook", 17],
      ["instagram", 16],
      ["pinterest", 12],
      ["youtube", 11],
      ["tiktok", 7],
      ["snapchat", 4],
    ],
    platform_F1: [
      ["linkedin", 21],
      ["twitter", 19],
      ["facebook", 17],
      ["instagram", 16],
      ["pinterest", 12],
      ["youtube", 11],
      ["tiktok", 7],
    ],
    // link_url set on 64 of 107.
    has_link: [
      ["true", 64],
      ["false", 43],
    ],
  },
  numbers: {
    // QA likes 0/0/13, comments 0/0/13, shares 0/0/0 are near empty; the mock invents wider ranges (synthetic) so the analytics read.
    likes: { min: 0, median: 6, max: 48 },
    comments: { min: 0, median: 2, max: 13 },
    shares: { min: 0, median: 1, max: 9 },
    // tenant_social_accounts has 0 rows in QA, so follower counts are synthetic. Bodies are capped at 140 characters (QA length(body) 38/0/782).
    followers: { min: 800, median: 4200, max: 18500 },
  },
  // government created 2026-09-08..2026-09-16, published 2026-09-10..2026-09-15 (overall 2026-07-11..2026-11-04).
  dates: { fromDaysAgo: 6, toDaysAgo: 122 },
};

export const formsShape: TableShape = {
  table: "application_forms",
  totals: { utilities: 137, financial: 42, government_federal: 133 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    status_U1: [
      ["archived", 115],
      ["published", 15],
      ["draft", 7],
      ["paused", 3],
    ],
    status_F1: [
      ["published", 33],
      ["draft", 5],
      ["archived", 4],
      ["paused", 2],
    ],
    status_G1: [
      ["published", 115],
      ["archived", 16],
      ["draft", 2],
      ["paused", 3],
    ],
    type_U1: [
      ["generic", 130],
      ["enrollment", 5],
      ["insurance_application", 1],
      ["application", 1],
    ],
    type_F1: [
      ["service_signup", 20],
      ["enrollment", 5],
      ["generic", 2],
      ["payment_banking_enrollment", 2],
      ["cardmember_enrollment", 2],
      ["merchant_portal_registration", 1],
      ["api_developer_access", 1],
      ["digital_services_enrollment", 1],
      ["merchant_enrollment", 1],
      ["corporate_program_enrollment", 1],
      ["mfa_registration", 1],
      ["buyer_enrollment", 1],
    ],
    type_G1: [
      ["generic", 127],
      ["enrollment", 4],
      ["service_signup", 1],
      ["permit_request", 1],
    ],
    // listed_public true on 35 of 133 (government only).
    listed_public_G1: [
      ["true", 35],
      ["false", 98],
    ],
  },
  numbers: {
    // total_submissions 0/6/11 (all), utilities 0/0/3.
    total_submissions: { min: 0, median: 6, max: 11 },
    total_submissions_U1: { min: 0, median: 0, max: 3 },
  },
  // utilities created 2026-06-22..2026-10-19.
  dates: { fromDaysAgo: 22, toDaysAgo: 141 },
};

export const submissionsShape: TableShape = {
  table: "application_submissions",
  totals: { utilities: 25, financial: 8, government_federal: 605 },
  source: {
    // Weights come from the government tenant, the one with the most rows.
    utilities: { tenant: "G1", borrowed: true },
    financial: { tenant: "G1", borrowed: true },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // G1 plus the whole-table rare statuses (pending_payment 3, returned_for_edits 1) lifted to a small share (synthetic) so those chips have rows.
    status: [
      ["approved", 196],
      ["converted", 116],
      ["pending", 108],
      ["under_review", 93],
      ["rejected", 92],
      ["pending_payment", 30],
      ["returned_for_edits", 8],
    ],
    // source_channel web 573 / invitation 32; source_platform direct 552, null 53.
    source: [
      ["web (direct)", 552],
      ["web", 21],
      ["invitation", 32],
    ],
    // submitter_name: First Last 397, company 54, null 12 (shown "Anonymous #...").
    submitter: [
      ["person", 397],
      ["organization", 54],
      ["anonymous", 12],
    ],
  },
  numbers: {
    // data.amount 100/23350.08/109350.82 (government payments).
    amount: { min: 100, median: 23350.08, max: 109350.82 },
  },
  // government submitted_at 2026-07-25..2026-09-25 (overall 2026-06-22..2026-11-10).
  dates: { fromDaysAgo: 0, toDaysAgo: 141 },
};
