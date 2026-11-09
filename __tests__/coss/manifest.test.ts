import { describe, expect, it } from "vitest";
import {
  COMPONENTS,
  COSS,
  COSS_LIBS,
  LIVE_IDS,
} from "../../scripts/coss/manifest.js";

describe("COSS pin", () => {
  it("pins one dated registry revision for the whole tree", () => {
    expect(COSS.revision).toMatch(/^[0-9a-f]{40}$/);
    expect(COSS.revisionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(COSS.registry).toBe("https://coss.com/ui/r");
  });
});

describe("COMPONENTS", () => {
  it("covers 67 components, each named once", () => {
    const names = COMPONENTS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toHaveLength(67);
    expect([...names].sort()).toEqual(names);
  });
  it("splits 53 coss-based from 14 v2-based, none shadcn-based, and fetches a reference base for 3 of the 14", () => {
    expect(COMPONENTS.filter((c) => c.source === "coss")).toHaveLength(53);
    expect(COMPONENTS.filter((c) => c.source === "v2")).toHaveLength(14);
    expect(
      COMPONENTS.filter((c) => c.source === "shadcn").map((c) => c.name),
    ).toEqual([]);
    // A shadcn-sourced component is pinned by scripts/shadcn/, never fetched from coss.
    for (const c of COMPONENTS.filter((c) => c.source === "shadcn"))
      expect(c.registry, c.name).toBeUndefined();
    expect(
      COMPONENTS.filter((c) => c.source === "v2" && c.registry).map(
        (c) => c.name,
      ),
    ).toEqual(["number-field", "sheet", "toolbar"]);
    for (const c of COMPONENTS.filter((c) => c.source === "v2" && c.registry)) {
      expect(c.disposition, c.name).toBe("measure-first");
    }
  });
  it("keeps exactly the three tilli-only divergences that were approved as deliberate", () => {
    const keeps = COMPONENTS.filter(
      (c) => c.disposition === "tilli-only" && c.approvedKeep,
    );
    expect(keeps.map((c) => c.name)).toEqual([
      "carousel",
      "number-ticker",
      "resizable",
    ]);
    expect(keeps.flatMap((c) => c.reapply)).toEqual([
      "CAR-1",
      "NUM-1",
      "RSZ-1",
    ]);
  });
  it("records the four dependency swaps as adoptions and drops their packages", () => {
    const adopt = COMPONENTS.filter((c) => c.disposition === "adopt");
    expect(adopt.map((c) => c.name)).toEqual([
      "calendar",
      "command",
      "drawer",
      "otp-field",
    ]);
    expect(adopt.flatMap((c) => c.drops ?? [])).toEqual([
      "react-aria-components",
      "@internationalized/date",
      "cmdk",
      "vaul",
      "input-otp",
    ]);
  });
  it("carries every lead on a component whose disposition could otherwise overwrite it", () => {
    const leads = Object.fromEntries(
      COMPONENTS.filter((c) => c.leads).map((c) => [c.name, c.leads]),
    );
    expect(Object.keys(leads).sort()).toEqual([
      "accordion",
      "breadcrumb",
      "collapsible",
      "frame",
      "spinner",
    ]);
  });
  it("ships no component with source coss and disposition tilli-only, or vice versa", () => {
    for (const c of COMPONENTS) {
      if (c.disposition === "tilli-only") expect(c.source, c.name).toBe("v2");
      if (c.source === "coss")
        expect(c.disposition, c.name).not.toBe("tilli-only");
    }
  });
});

describe("COSS_LIBS", () => {
  it("vendors the non-component registry items (libs and hooks), outside components/", () => {
    expect(COSS_LIBS.map((l) => l.registry)).toEqual([
      "segmented-control",
      "use-media-query",
      "use-copy-to-clipboard",
      "composer-editor",
      "composer-document",
      "composer-query",
      "composer-clipboard",
      "use-composer-editor",
    ]);
    for (const l of COSS_LIBS) {
      expect(l.base, l.registry).toMatch(/^(lib|hooks)\//);
      expect(l.dest, l.registry).toBe(l.base);
    }
  });
  it("marks every item added after the pin with its upstream source path", () => {
    const postPin = [
      ...COMPONENTS.filter((c) => c.postPin),
      ...COSS_LIBS.filter((l) => l.postPin),
    ];
    expect(postPin.map((e) => e.registry ?? e.name).sort()).toEqual([
      "chat",
      "composer",
      "composer-clipboard",
      "composer-document",
      "composer-editor",
      "composer-query",
      "use-composer-editor",
    ]);
    for (const e of postPin)
      expect(e.postPin, e.registry).toMatch(/^packages\/ui\/src\//);
    // Only a kit locks more than one file; its postPin is a directory, not a file.
    expect(COMPONENTS.filter((c) => c.multiFile).map((c) => c.name)).toEqual([
      "chat",
    ]);
    for (const c of COMPONENTS.filter((c) => c.multiFile))
      expect(c.postPin, c.name).not.toMatch(/\.tsx?$/);
    // must NOT also be a COMPONENTS registry name: that would write .coss-base/segmented-control.tsx
    expect(
      COMPONENTS.find((c) => c.name === "segmented-control")?.registry,
    ).toBeUndefined();
  });
});

describe("LIVE_IDS", () => {
  it("is exactly the 40 ids that stay live, each with a resolution", () => {
    expect(Object.keys(LIVE_IDS)).toHaveLength(40);
    for (const [id, r] of Object.entries(LIVE_IDS)) {
      expect(id, id).toMatch(/^[A-Z]{2,4}-\d$/);
      expect(r.resolution, id).toMatch(
        /^(reset|re-apply|re-author|adopt|drop|keep|deferred)\b/,
      );
      expect(r.why, id).toBeTruthy();
    }
  });
  it("attaches every re-apply id to the component that owns it", () => {
    for (const c of COMPONENTS)
      for (const id of c.reapply)
        expect(LIVE_IDS[id], `${c.name} → ${id}`).toBeDefined();
  });
});
