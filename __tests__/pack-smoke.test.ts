import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(join(root, "scripts/pack-smoke.sh"), "utf8");
const pkg = JSON.parse(
  readFileSync(join(root, "packages/ui-atoms/package.json"), "utf8"),
) as { files: string[] };

// The `for path in … ; do` list is the smoke's "must be present" allowlist.
const required = (script.match(/^for path in (.+); do$/m)?.[1] ?? "")
  .split(/\s+/)
  .filter(Boolean);

const TAR_PIPED_INTO_GREP = /tar -tzf [^|\n]*\|\s*grep/;

describe("pack-smoke", () => {
  it("asserts the presence of every file the package publishes", () => {
    expect(required.length).toBeGreaterThan(0);
    for (const entry of pkg.files) {
      // `dist` is a directory: the stylesheet entrypoint stands in for it, since
      // every other dist file the smoke cares about is covered by an import.
      const expected =
        entry === "dist" ? "package/dist/styles.css" : `package/${entry}`;
      expect(required).toContain(expected);
    }
  });

  it("reads the tarball listing from a file, not from a pipe into grep", () => {
    // `tar -tzf … | grep -q` fails under `set -o pipefail`: grep exits at the
    // first match and the resulting SIGPIPE kills GNU tar, so a file that is
    // present reports as missing on Linux while passing on macOS.
    expect(script).not.toMatch(TAR_PIPED_INTO_GREP);
  });

  it("builds before packing, so a stale dist cannot pass", () => {
    expect(script).toContain('(cd "$ROOT" && pnpm build)');
    expect(script.indexOf('(cd "$ROOT" && pnpm build)')).toBeLessThan(
      script.indexOf("pnpm pack --pack-destination"),
    );
  });
});
