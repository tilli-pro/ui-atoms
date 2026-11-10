import { SEMVER_PATTERN } from "../recipes-manifest.js";

export type Bump = "patch" | "minor" | "major";

export const BUMPS: readonly Bump[] = ["patch", "minor", "major"];

export function bumpVersion(version: string, bump: Bump): string {
  const match = SEMVER_PATTERN.exec(version);
  if (!match)
    throw new Error(`"${version}" is not a MAJOR.MINOR.PATCH version`);
  const [major, minor, patch] = match.slice(1).map(Number) as [
    number,
    number,
    number,
  ];
  switch (bump) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump "${String(bump)}"`);
  }
}
