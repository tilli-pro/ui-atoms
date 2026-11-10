import { numberRange, plusDays, tenantOf, weights } from "../finance/common.js";
import { moneyFrom } from "../money.js";
import { ANCHOR, createRng, seedFor } from "../random.js";
import { postsShape } from "../shapes/engage.js";
import { COUNTS, kebab, lookup } from "./common.js";
import type { Persona } from "../../specs/types.js";
import type { SourceTenant } from "../shapes/types.js";
import type {
  EngagePlatformStat,
  EngagePost,
  EngagePostEngagement,
  PostStatus,
  TemplateApproval,
} from "./types.js";

export const POST_TOPICS = [
  "Storm season is here. Check our readiness tips before the next front arrives.",
  "Planned maintenance this weekend may briefly affect service in some areas.",
  "Autopay takes the guesswork out of due dates. Sign up in a minute.",
  "New rebate program now open. See if your household qualifies.",
  "Our offices close early on Friday. Online services stay available.",
  "Beware of payment scams: we never ask for gift cards by phone.",
  "Meet the crew keeping the lights on during the cold snap.",
  "Paperless billing is quicker and keeps your statements in one place.",
  "Applications for the assistance program close at the end of the month.",
  "Thank you for your feedback. Here is what we changed this quarter.",
  "Update your contact details to get alerts that matter to you.",
  "Public comment period is open for the new service plan.",
];

export const genPosts = (
  persona: Persona,
): {
  posts: EngagePost[];
  platforms: readonly (readonly [string, number])[];
} => {
  const rng = createRng(seedFor(persona, "engage.posts"));
  const e = postsShape.enums;
  const tenant = tenantOf<SourceTenant>(postsShape, persona.key);
  const platformWeights = lookup<string>(e, "platform", tenant);
  const window = postsShape.dates as { fromDaysAgo: number; toDaysAgo: number };
  const likes = numberRange(postsShape, "likes");
  const comments = numberRange(postsShape, "comments");
  const shares = numberRange(postsShape, "shares");
  const total = COUNTS.posts;
  const posts = Array.from({ length: total }, (_, i): EngagePost => {
    // The first rows are the synthetic scheduled posts for the Schedule segment.
    const scheduled = i < COUNTS.scheduledPosts;
    const status: PostStatus = scheduled
      ? "scheduled"
      : rng.weighted(weights<PostStatus>(e, "status"));
    const chosen = new Set<string>();
    for (let n = 1 + rng.int(0, 2); chosen.size < n; )
      chosen.add(rng.weighted(platformWeights));
    const body = rng.pick(POST_TOPICS);
    let scheduledAt: Date | null = null;
    let publishedAt: Date | null = null;
    let engagement: EngagePostEngagement = { likes: 0, comments: 0, shares: 0 };
    let errors = 0;
    if (scheduled) {
      // Six land inside the coming week, the rest later.
      scheduledAt = i < 6 ? rng.daysAhead(1, 6) : rng.daysAhead(7, 21);
    } else if (status === "published") {
      publishedAt = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
      scheduledAt = rng.bool(0.55)
        ? plusDays(publishedAt, -rng.next() * 0.3)
        : null;
      engagement = {
        likes: Math.round(moneyFrom(rng, likes)),
        comments: Math.round(moneyFrom(rng, comments)),
        shares: Math.round(moneyFrom(rng, shares)),
      };
    } else if (status === "failed") {
      scheduledAt = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
      errors = rng.int(1, 3);
    } else if (status === "draft") {
      scheduledAt = rng.bool(0.3) ? rng.daysAhead(1, 20) : null;
    } else if (status === "cancelled") {
      scheduledAt = rng.daysAgo(1, 30);
    } else {
      scheduledAt = plusDays(ANCHOR, -rng.next() * 0.02);
    }
    const approval: TemplateApproval =
      status === "draft"
        ? rng.weighted<TemplateApproval>([
            ["pending", 55],
            ["approved", 25],
            ["rejected", 20],
          ])
        : status === "cancelled"
          ? "rejected"
          : "approved";
    const slug = kebab(body).slice(0, 32);
    return {
      id: `post-${i + 1}`,
      body: body.slice(0, 140),
      status,
      approval,
      platforms: [...chosen],
      scheduledAt,
      publishedAt,
      engagement,
      link:
        rng.weighted(weights<string>(e, "has_link")) === "true"
          ? `https://example.org/updates/${slug}`
          : null,
      errors,
    };
  });
  return { posts, platforms: platformWeights };
};

export const genPlatformStats = (
  persona: Persona,
  posts: EngagePost[],
  platforms: readonly (readonly [string, number])[],
): EngagePlatformStat[] => {
  const rng = createRng(seedFor(persona, "engage.platformStats"));
  const followers = numberRange(postsShape, "followers");
  return platforms.map(([platform]): EngagePlatformStat => {
    const mine = posts.filter((p) => p.platforms.includes(platform));
    return {
      id: platform,
      platform,
      posts: mine.length,
      engagement: mine.reduce(
        (sum, p) =>
          sum +
          p.engagement.likes +
          p.engagement.comments +
          p.engagement.shares,
        0,
      ),
      followers: Math.round(rng.range(followers, 0)),
    };
  });
};
