#!/usr/bin/env bash
# Proves the published artefact (not the workspace link) works for a consumer:
# exports map, ESM resolution, preserved "use client", optional-peer failure mode.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
# The consumer install below is deliberately npm, not pnpm: it resolves the tarball
# the way a consumer would. Fail early and loudly if the runner has no npm.
command -v npm >/dev/null || { echo "pack-smoke: npm is required for the consumer install"; exit 1; }
# `pnpm pack` runs prepack/prepare, neither of which this package defines, so packing
# does not rebuild: without this line a stale or partial dist would pass silently.
(cd "$ROOT" && pnpm build)
cd "$ROOT/packages/ui-atoms"
pnpm pack --pack-destination "$TMP" >/dev/null
TGZ="$(ls "$TMP"/*.tgz)"

# Listed once into a file rather than piped per check: `grep -q` exits at its
# first match, and under `set -o pipefail` the SIGPIPE that kills GNU tar makes
# the pipeline fail — a present file then reads as missing (it does on Linux CI,
# where tar is GNU, and not on macOS, where it is bsdtar).
ENTRIES="$TMP/entries.txt"
tar -tzf "$TGZ" > "$ENTRIES"

echo "— tarball must contain every published file"
# One entry per `files` member in package.json (`dist` stands in as its stylesheet
# entrypoint, the one dist file no import-time check below would notice missing).
# __tests__/pack-smoke.test.ts keeps this list in step with `files`.
for path in package/dist/styles.css package/README.md package/LICENSE package/THIRD-PARTY-NOTICES.md; do
  grep -Fqx "$path" "$ENTRIES" || { echo "missing from tarball: $path"; exit 1; }
done
echo "— tarball must contain no forbidden files"
if grep -E '\.(woff2?|ttf)$|/tenants/|sst-env|\.env' "$ENTRIES"; then echo "forbidden file in tarball"; exit 1; fi
echo "— dist keeps use client directives"
# button calls useRender and must carry the directive; fieldset is a hookless cn()
# wrapper over the Base UI root and must not — the audit rule, not the coss base's
# own directive, decides.
tar -xzf "$TGZ" -C "$TMP" package/dist/components/button/index.js package/dist/components/fieldset/index.js
head -1 "$TMP/package/dist/components/button/index.js" | grep -q '"use client";'
! head -1 "$TMP/package/dist/components/fieldset/index.js" | grep -q 'use client'

echo "— consumer install + import"
mkdir -p "$TMP/consumer" && cd "$TMP/consumer"
npm init -y >/dev/null
npm i --no-audit --no-fund --silent "$TGZ" react@19.2.1 react-dom@19.2.1 @base-ui/react@1.8.0 tailwindcss@4.1.17
node --input-type=module -e '
import { Button, ButtonPrimitive, buttonVariants } from "@tilli.dev/ui-atoms/button";
import { DialogPopup } from "@tilli.dev/ui-atoms/dialog";
import { cn } from "@tilli.dev/ui-atoms/utils";
if (typeof Button !== "function" || typeof ButtonPrimitive !== "function" || typeof DialogPopup !== "function") throw new Error("exports");
if (!buttonVariants({ size: "icon" }).includes("size-8")) throw new Error("variants");
if (cn("p-2", "p-4") !== "p-4") throw new Error("cn");
console.log("consumer import ok");
'
echo "— optional peer absent → module-not-found names the peer"
node --input-type=module -e '
import("@tilli.dev/ui-atoms/carousel").then(() => { throw new Error("expected failure"); }, (e) => {
  if (e.code !== "ERR_MODULE_NOT_FOUND" || !String(e.message).includes("embla-carousel-react")) throw e;
  console.log("optional peer failure mode ok:", e.code);
});
'
echo "pack-smoke: ok"
