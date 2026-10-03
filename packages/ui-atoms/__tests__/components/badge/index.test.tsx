import { describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "../../../src/components/badge/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Badge (cva beta migration)", () => {
  it("renders with slot and variant classes", () => {
    render(
      <Badge size="lg" variant="success">
        ok
      </Badge>,
    );
    const el = screen.getByText("ok");
    expectSlot(el, "badge");
    expect(el.className).toContain("bg-success/8");
    expect(el.className).toContain("text-sm");
  });
  it("variants object is cva-beta shaped (callable with an options object)", () => {
    // the outline variant is the base's, not the fork's: `border-input bg-background`,
    // not `border-border bg-transparent` (coss badge.tsx @8163481)
    expect(badgeVariants({ variant: "outline" })).toContain("border-input");
    expect(badgeVariants({ variant: "outline" })).toContain("bg-background");
  });
});
