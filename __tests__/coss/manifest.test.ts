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
  it("splits 54 coss-based from 11 v2-based and 2 shadcn-based, and fetches a reference base for 3 of the 11", () => {
    expect(COMPONENTS.filter((c) => c.source === "coss")).toHaveLength(54);
    expect(COMPONENTS.filter((c) => c.source === "v2")).toHaveLength(11);
    expect(
      COMPONENTS.filter((c) => c.source === "shadcn").map((c) => c.name),
    ).toEqual(["carousel", "resizable"]);
    // A shadcn-sourced component is pinned by scripts/shadcn/, never fetched from coss.
    for (const c of COMPONENTS.filter((c) => c.source === "shadcn"))
      expect(c.registry, c.name).toBeUndefined();
    expect(
      COMPONENTS.filter((c) => c.source === "v2" && c.registry).map(
        (c) => c.name,
      ),
    ).toEqual(["number-field", "segmented-control", "toolbar"]);
    for (const c of COMPONENTS.filter((c) => c.source === "v2" && c.registry)) {
      expect(c.disposition, c.name).toBe("measure-first");
    }
  });
  it("keeps exactly the three divergences from coss that were approved as deliberate", () => {
    // carousel and resizable turned out to be shadcn/ui's and are sourced there;
    // number-ticker has no upstream in either registry.
    const keeps = COMPONENTS.filter((c) => c.approvedKeep);
    expect(keeps.map((c) => [c.name, c.source, c.disposition])).toEqual([
      ["carousel", "shadcn", "keep-ours"],
      ["number-ticker", "v2", "tilli-only"],
      ["resizable", "shadcn", "merge-selectively"],
    ]);
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
      "combobox",
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
  it("carries no post-pin item: composer, its libs and chat are inside the tree at this pin", () => {
    expect([
      ...COMPONENTS.filter((c) => c.postPin),
      ...COSS_LIBS.filter((l) => l.postPin),
    ]).toEqual([]);
    // Only a kit locks more than one file.
    expect(COMPONENTS.filter((c) => c.multiFile).map((c) => c.name)).toEqual([
      "chat",
    ]);
  });
  it("fetches coss's segmented-control as a component base, not as a lib", () => {
    // Upstream turned the cva lib into a registry:ui component; a COSS_LIBS entry of the
    // same name would lock a path that no longer exists.
    expect(
      COMPONENTS.find((c) => c.name === "segmented-control")?.registry,
    ).toBe("segmented-control");
    expect(COSS_LIBS.map((l) => l.registry)).not.toContain("segmented-control");
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
