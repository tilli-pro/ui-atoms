import { describe, expect, it } from "vitest";
import {
  Radio,
  RadioGroup,
  RadioGroupPrimitive,
  RadioPrimitive,
  radioGroupVariants,
  radioVariants,
} from "../../../src/components/radio-group/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("RadioGroup / Radio", () => {
  it("styled parts carry slots and classes", () => {
    render(
      <RadioGroup aria-label="g" defaultValue="a">
        <Radio aria-label="a" value="a" />
        <Radio aria-label="b" value="b" />
      </RadioGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "g" });
    expectSlot(group, "radio-group");
    expect(group.className).toBe("flex flex-col gap-3");
    const a = screen.getByRole("radio", { name: "a" });
    expectSlot(a, "radio");
    expect(a.className).toContain("rounded-full");
    expect(a.querySelector('[data-slot="radio-indicator"]')).not.toBeNull();
  });
  it("primitives are bare; variants exported", () => {
    render(
      <RadioGroupPrimitive aria-label="g2">
        <RadioPrimitive aria-label="x" value="x" />
      </RadioGroupPrimitive>,
    );
    expect(screen.getByRole("radiogroup", { name: "g2" }).className).toBe("");
    expect(screen.getByRole("radio", { name: "x" }).className).toBe("");
    expect(radioGroupVariants()).toBe("flex flex-col gap-3");
    expect(radioVariants()).toContain("size-4");
  });
});
