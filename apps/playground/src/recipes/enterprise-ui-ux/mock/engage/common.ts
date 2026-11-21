import { ANCHOR, type Rng } from "../random.js";
import type { SourceTenant } from "../shapes/types.js";

export const COUNTS = {
  campaigns: 48,
  audiences: 44,
  templates: 60,
  sent: 60,
  posts: 56,
  scheduledPosts: 8,
  forms: 48,
  submissions: 56,
} as const;

/** A date between two instants, never past the anchor. */
export const between = (rng: Rng, from: Date, to: Date): Date =>
  new Date(
    Math.min(
      from.getTime() + rng.next() * Math.max(0, to.getTime() - from.getTime()),
      ANCHOR.getTime(),
    ),
  );

export const kebab = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** First `count` of a shuffled cross product of topics and variants, so names stay unique. */
export const uniqueNames = (
  rng: Rng,
  topics: readonly string[],
  variants: readonly string[],
  count: number,
): string[] =>
  rng
    .shuffle(topics.flatMap((t) => variants.map((v) => `${t}${v}`)))
    .slice(0, count);

export const lookup = <T extends string>(
  enums: Record<string, readonly (readonly [string, number])[]>,
  base: string,
  tenant: SourceTenant,
): readonly (readonly [T, number])[] =>
  (enums[`${base}_${tenant}`] ?? enums[base]) as unknown as readonly (readonly [
    T,
    number,
  ])[];

export const pickMany = (
  rng: Rng,
  items: readonly string[],
  n: number,
): string[] => rng.shuffle(items).slice(0, n);
