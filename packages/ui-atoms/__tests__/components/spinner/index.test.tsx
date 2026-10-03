import { describe, expect, it } from "vitest";
import { Spinner } from "../../../src/components/spinner/index.js";
import { render, screen } from "../../helpers/render.js";

describe("Spinner (we keep the size-4 default upstream dropped)", () => {
  it("renders a labelled status icon that spins at size-4 by default", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el.getAttribute("class")).toContain("animate-spin");
    expect(el.getAttribute("class")).toContain("size-4");
    expect(el).toHaveAttribute("aria-label", "Loading");
  });
  it("takes the lucide icon props SPN-1 widened it to, and a caller size wins", () => {
    render(
      <Spinner absoluteStrokeWidth={true} className="size-6" strokeWidth={3} />,
    );
    const el = screen.getByRole("status");
    expect(el.getAttribute("class")).toContain("size-6");
    expect(el.getAttribute("class")).not.toContain("size-4");
    expect(el).toHaveAttribute("stroke-width", "3");
  });
});
