import { describe, expect, it } from "vitest";
import {
  Input,
  InputPrimitive,
  inputControlVariants,
  inputVariants,
} from "../../../src/components/input/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Input", () => {
  it("styled: wrapper span + input with slots, size and type classes", () => {
    render(<Input aria-label="q" size="sm" type="search" />);
    const input = screen.getByRole("searchbox", { name: "q" });
    expectSlot(input, "input");
    expect(input.className).toContain("rounded-[inherit]");
    expect(input.className).toContain("px-[calc(--spacing(2.5)-1px)]");
    expect(input.className).toContain(
      "[&::-webkit-search-cancel-button]:appearance-none",
    );
    const wrapper = input.parentElement as HTMLElement;
    expectSlot(wrapper, "input-control");
    expect(wrapper).toHaveAttribute("data-size", "sm");
    expect(wrapper.className).toContain("rounded-lg border border-input");
  });
  it("type=file gets the base's file rule — an inline branch on props.type, not a variant", () => {
    render(<Input aria-label="f" type="file" />);
    // an input[type=file] has no implicit ARIA role, so query it by its label
    expect(screen.getByLabelText("f").className).toContain("file:me-3");
  });
  it("INP-1: className lands on the wrapper; numeric size is the attribute; unstyled drops the wrapper chrome", () => {
    render(
      <Input aria-label="n" className="max-w-40" size={12} unstyled={true} />,
    );
    const input = screen.getByRole("textbox", { name: "n" });
    expect(input).toHaveAttribute("size", "12");
    const wrapper = input.parentElement as HTMLElement;
    expectSlot(wrapper, "input-control");
    expect(wrapper.className).toBe("max-w-40"); // the caller's classes and nothing else
    expect(wrapper).toHaveAttribute("data-size", "12");
    // `unstyled` only strips the wrapper chrome; the inner input keeps its own classes.
    expect(input.className).toContain("rounded-[inherit]");
  });
  it("INP-1 / INP-2: the reset props are gone from the type", () => {
    // @ts-expect-error containerClassName was dropped with INP-1; className targets the wrapper.
    render(<Input aria-label="r1" containerClassName="max-w-40" />);
    // @ts-expect-error the ghost variant was dropped with INP-2; `unstyled` covers it.
    render(<Input aria-label="r2" variant="ghost" />);
  });
  it("primitive is bare on both elements; variants exported", () => {
    render(<InputPrimitive aria-label="p" />);
    const input = screen.getByRole("textbox", { name: "p" });
    expect(input.className).toBe("");
    expect((input.parentElement as HTMLElement).className).toBe("");
    expect(inputVariants()).toContain("px-[calc(--spacing(3)-1px)]");
    expect(inputVariants({ size: "sm" })).toContain(
      "px-[calc(--spacing(2.5)-1px)]",
    );
    expect(inputControlVariants()).toContain("has-focus-visible:ring-[3px]");
  });
});
