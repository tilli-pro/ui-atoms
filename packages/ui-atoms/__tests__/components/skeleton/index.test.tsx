import { describe, expect, it } from "vitest";
import {
  Skeleton,
  SkeletonPrimitive,
  skeletonVariants,
} from "../../../src/components/skeleton/index.js";
import { expectSlot, render } from "../../helpers/render.js";

describe("Skeleton", () => {
  it("styled: animate-skeleton base + className merge", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const el = container.querySelector('[data-slot="skeleton"]');
    expectSlot(el, "skeleton");
    expect(el.className).toContain("animate-skeleton");
    expect(el.className).toContain("h-4 w-20");
  });
  it("primitive is a bare div with the slot", () => {
    const { container } = render(<SkeletonPrimitive aria-hidden={true} />);
    const el = container.querySelector('[data-slot="skeleton"]') as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toBe("");
    expect(skeletonVariants()).toContain("rounded-sm");
  });
});
