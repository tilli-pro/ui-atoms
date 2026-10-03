import { describe, expect, it } from "vitest";
import {
  Fieldset,
  FieldsetLegend,
  FieldsetPrimitive,
  fieldsetLegendVariants,
  fieldsetVariants,
} from "../../../src/components/fieldset/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Fieldset", () => {
  it("styled parts carry slots and v2 classes minus the FST-1 cap", () => {
    render(
      <Fieldset data-testid="fs">
        <FieldsetLegend>L</FieldsetLegend>
      </Fieldset>,
    );
    expectSlot(screen.getByTestId("fs"), "fieldset");
    expect(screen.getByTestId("fs").className).not.toContain("max-w-64"); // FST-1
    expect(screen.getByTestId("fs").className).toContain("min-w-0");
    expectSlot(screen.getByText("L"), "fieldset-legend");
    expect(screen.getByText("L").className).toContain("font-semibold");
  });
  it("primitive has no classes; variants exported", () => {
    render(<FieldsetPrimitive data-testid="fs" />);
    expect(screen.getByTestId("fs").className).toBe("");
    expect(fieldsetVariants()).toBe("flex w-full min-w-0 flex-col gap-6");
    expect(fieldsetLegendVariants()).toBe("font-semibold");
  });
});
