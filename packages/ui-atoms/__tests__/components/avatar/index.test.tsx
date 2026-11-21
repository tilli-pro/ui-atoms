import { describe, expect, it } from "vitest";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  avatarGroupVariants,
} from "../../../src/components/avatar/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("AvatarGroup (coss avatar.tsx @b2336c4)", () => {
  it("renders the group, its avatars and the count with the coss data-slots", () => {
    render(
      <AvatarGroup data-testid="group">
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>,
    );
    const group = screen.getByTestId("group");
    expectSlot(group, "avatar-group");
    expect(group.getAttribute("data-topmost")).toBe("first");
    // The cut-out image is data the mask classes read, so it rides on `style`.
    expect(group.style.getPropertyValue("--avatar-group-cut-image")).toContain(
      "data:image/svg+xml",
    );
    expectSlot(
      screen.getByText("+3").closest("[data-slot=avatar-group-count]"),
      "avatar-group-count",
    );
    expectSlot(screen.getByText("AB"), "avatar-fallback");
  });

  it("flips which end is cut out with `topmost`", () => {
    render(<AvatarGroup data-testid="group" topmost="last" />);
    expect(screen.getByTestId("group").getAttribute("data-topmost")).toBe(
      "last",
    );
    expect(avatarGroupVariants({ topmost: "first" })).toContain(
      "*:not-first:mask-subtract",
    );
    expect(avatarGroupVariants({ topmost: "last" })).toContain(
      "*:not-last:mask-subtract",
    );
  });
});
