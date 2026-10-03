import { describe, expect, it } from "vitest";
import { AspectRatio } from "../../../src/components/aspect-ratio/index.js";
import { render, screen } from "../../helpers/render.js";

describe("AspectRatio (rewritten on base-ui useRender, no vendored Radix)", () => {
  it("wrapper uses the padding-bottom ratio trick; inner element fills it", () => {
    render(
      <AspectRatio data-testid="inner" ratio={2}>
        <img alt="" height={1} width={2} />
      </AspectRatio>,
    );
    const inner = screen.getByTestId("inner");
    expect(inner).toHaveAttribute("data-slot", "aspect-ratio");
    expect(inner.style.position).toBe("absolute");
    const wrapper = inner.parentElement as HTMLElement;
    expect(wrapper).toHaveAttribute("data-slot", "aspect-ratio-wrapper");
    expect(wrapper.style.paddingBottom).toBe("50%");
  });
  it("render prop swaps the inner element", () => {
    render(<AspectRatio data-testid="s" render={<section />} />);
    expect(screen.getByTestId("s").tagName).toBe("SECTION");
  });
});
