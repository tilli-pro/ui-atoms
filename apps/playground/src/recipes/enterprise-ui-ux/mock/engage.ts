import { sameDay } from "./common.js";
import { genForms, genSubmissions } from "./engage/applications.js";
import {
  genAudiences,
  genCampaigns,
  genSent,
  genTemplates,
} from "./engage/outreach.js";
import { genPlatformStats, genPosts } from "./engage/social.js";
import { ANCHOR } from "./random.js";
import {
  audiencesShape,
  campaignsShape,
  formsShape,
  postsShape,
  sentShape,
  submissionsShape,
  templatesShape,
} from "./shapes/engage.js";
import type { Persona } from "../specs/types.js";
import type {
  EngageCampaign,
  EngageData,
  EngageRowSet,
} from "./engage/types.js";

export type * from "./engage/types.js";

const cache = new Map<string, EngageData>();

export const engageData = (persona: Persona): EngageData => {
  const cached = cache.get(persona.key);
  if (cached) return cached;
  const campaigns = genCampaigns(persona);
  const audiences = genAudiences(persona);
  const templates = genTemplates(persona);
  const sent = genSent(persona, campaigns);
  const { posts, platforms } = genPosts(persona);
  const platformStats = genPlatformStats(persona, posts, platforms);
  const forms = genForms(persona);
  const submissions = genSubmissions(persona, forms);
  const key = persona.key;
  const live: Record<EngageRowSet, number> = {
    campaigns: campaignsShape.totals[key],
    audiences: audiencesShape.totals[key],
    templates: templatesShape.totals[key],
    sent: sentShape.totals[key],
    posts: postsShape.totals[key],
    forms: formsShape.totals[key],
    submissions: submissionsShape.totals[key],
  };
  const counts: Record<EngageRowSet, number> = {
    campaigns: campaigns.length,
    audiences: audiences.length,
    templates: templates.length,
    sent: sent.length,
    posts: posts.length,
    forms: forms.length,
    submissions: submissions.length,
  };
  const totals = { ...live };
  for (const set of Object.keys(counts) as EngageRowSet[]) {
    totals[set] = Math.max(live[set], counts[set]);
  }
  const attempted = sent.filter((s) => s.status !== "pending");
  const good = attempted.filter((s) => s.status !== "failed");
  const sum = (pick: (c: EngageCampaign) => number) =>
    campaigns.reduce((n, c) => n + pick(c), 0);
  const data: EngageData = {
    campaigns,
    audiences,
    templates,
    sent,
    posts,
    forms,
    submissions,
    platformStats,
    summary: {
      campaignsLive: campaigns.filter(
        (c) => c.status === "running" || c.status === "scheduled",
      ).length,
      sentToday: sent.filter((s) => sameDay(s.createdAt, ANCHOR)).length,
      deliveryRate: attempted.length
        ? Math.round((good.length / attempted.length) * 1000) / 10
        : 0,
      audiences: audiences.length,
      audiencesPendingApproval: audiences.filter(
        (a) => a.status === "pending_approval",
      ).length,
      formsPublished: forms.filter((f) => f.status === "published").length,
      templatesInReview: templates.filter((t) => t.approval === "pending")
        .length,
      scheduledPosts: posts.filter((p) => p.status === "scheduled").length,
      pendingPaymentSubmissions: submissions.filter(
        (s) => s.status === "pending_payment",
      ).length,
      performance: {
        sent: sum((c) => c.sent),
        delivered: sum((c) => c.delivered),
        opened: sum((c) => c.opened),
        clicked: sum((c) => c.clicked),
        failed: sum((c) => c.failed),
      },
    },
    totals,
  };
  cache.set(key, data);
  return data;
};
