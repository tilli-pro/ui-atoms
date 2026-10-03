import { describe, expect, it } from "vitest";
import {
  Form,
  FormPrimitive,
  formVariants,
} from "../../../src/components/form/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Form (FRM-1 — reset to coss: Form contributes no layout)", () => {
  it("contributes no classes of its own and passes className straight through", () => {
    render(
      <Form aria-label="f1">
        <input />
      </Form>,
    );
    const f = screen.getByRole("form", { name: "f1" });
    expectSlot(f, "form");
    // FRM-1: v2's `flex w-full flex-col gap-4` is gone. Callers that want that layout add it
    // themselves; the component must not.
    expect(f.className).toBe("");
    expect(f.className).not.toContain("gap-4");
    render(<FormPrimitive aria-label="f2" />);
    expect(screen.getByRole("form", { name: "f2" }).className).toBe("");
    // The export survives with an empty base so downstream tenant forks compose over it.
    expect(formVariants()).toBe("");
    // cn("", "gap-2") is exactly "gap-2", so the pass-through assertion is exact.
    render(<Form aria-label="f3" className="gap-2" />);
    expect(screen.getByRole("form", { name: "f3" }).className).toBe("gap-2");
  });
});
