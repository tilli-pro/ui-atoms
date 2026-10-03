import { describe, expect, it } from "vitest";
import {
  Button,
  ButtonPrimitive,
  buttonVariants,
} from "../../../src/components/button/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Button (coss base + the BTN-3 triple)", () => {
  it("styled: renders a button with data-slot, type=button and the default variant classes", () => {
    render(<Button>Go</Button>);
    const el = screen.getByRole("button", { name: "Go" });
    expectSlot(el, "button");
    expect(el).toHaveAttribute("type", "button");
    expect(el.className).toContain("bg-primary");
    expect(el.className).toContain("h-8");
  });
  it("styled: variant/size/className merge through cva + cn", () => {
    render(
      <Button className="p-9" size="icon" variant="ghost">
        x
      </Button>,
    );
    const el = screen.getByRole("button");
    expect(el.className).toContain("border-transparent");
    expect(el.className).toContain("size-8");
    expect(el.className).toContain("p-9");
    expect(el.className).not.toContain("bg-primary");
  });
  it("render prop composes another element and drops the implicit type", () => {
    render(<Button render={<a href="#x" />}>Link</Button>);
    const a = screen.getByRole("link", { name: "Link" });
    expectSlot(a, "button");
    expect(a).not.toHaveAttribute("type");
  });
  it("BTN-2: loading renders the spinner slot, sets data-loading and aria-disabled, and disables", () => {
    render(<Button loading={true}>Save</Button>);
    const el = screen.getByRole("button");
    expect(el).toHaveAttribute("data-loading", "");
    expect(el).toHaveAttribute("aria-disabled", "true");
    expect(el).toBeDisabled();
    expect(
      el.querySelector('[data-slot="button-loading-indicator"]'),
    ).not.toBeNull();
  });
  it("BTN-1 is gone: there are no IconLeft/IconRight props, children carry the icons", () => {
    const Icon = (p: { className?: string }) => (
      <svg data-testid="ico" {...p} />
    );
    render(
      <ButtonPrimitive>
        <Icon />
        Go
      </ButtonPrimitive>,
    );
    expect(screen.getByTestId("ico")).not.toBeNull();
    expect(screen.getByRole("button").className).toBe("");
  });
  it("primitive carries no variant classes", () => {
    render(<ButtonPrimitive>x</ButtonPrimitive>);
    const el = screen.getByRole("button");
    expectSlot(el, "button");
    expect(el.className).not.toContain("bg-primary");
    expect(el.className).not.toContain("rounded-lg");
  });
  it("BTN-4 is gone and the size ramp is held back: no syguize- typo, no sm: pairs", () => {
    const all = Object.values([
      "default",
      "sm",
      "lg",
      "xs",
      "xl",
      "icon",
      "icon-xs",
      "icon-sm",
      "icon-lg",
      "icon-xl",
    ] as const)
      .map((size) => buttonVariants({ size }))
      .join(" ");
    expect(all).not.toContain("syguize-");
    expect(all).not.toMatch(/\bsm:/);
    expect(buttonVariants({ variant: "link" })).toContain("underline-offset-4");
    expect(buttonVariants({ size: "icon-xl" })).toContain("size-10");
  });
});
