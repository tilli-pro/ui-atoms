import { describe, expect, it } from "vitest";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldErrorPrimitive,
  FieldItem,
  FieldLabel,
  FieldPrimitive,
  fieldErrorVariants,
  fieldVariants,
} from "../../../src/components/field/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Field family (one coss base file — FLD-1/FLD-4 live, FLD-2/3/5/6 reset)", () => {
  it("FLD-6: root/label/item/control/description carry the coss slots and layout", () => {
    render(
      <Field className="items-center" data-testid="field">
        <FieldLabel>Name</FieldLabel>
        <FieldItem data-testid="item">
          <FieldControl />
        </FieldItem>
        <FieldDescription>Help</FieldDescription>
      </Field>,
    );
    const root = screen.getByTestId("field");
    expectSlot(root, "field");
    // FLD-5: `centered` is gone; the one sandbox site passes className, and
    // tailwind-merge drops the base's items-start in its favour.
    expect(root.className).toContain("items-center");
    expect(root.className).not.toContain("space-y-2");
    const label = screen.getByText("Name");
    expectSlot(label, "field-label");
    // LBL-2: the dead peer-disabled hook is replaced by the base's data attribute.
    expect(label.className).toContain("data-disabled:opacity-64");
    expect(label.className).not.toContain("peer-disabled:");
    expectSlot(screen.getByTestId("item"), "field-item"); // FLD-4
    expectSlot(screen.getByText("Help"), "field-description");
  });
  it("FLD-1: FieldError is a real Field.Error — it renders nothing while the field is valid", () => {
    render(
      <Field>
        <FieldControl />
        <FieldError>never shown</FieldError>
      </Field>,
    );
    expect(screen.queryByText("never shown")).toBeNull();
  });
  it("FLD-1/FLD-2: match={true} shows it, and children render verbatim (no arktype rewrite)", () => {
    render(
      <Field>
        <FieldControl />
        <FieldError match={true}>firstName is required</FieldError>
      </Field>,
    );
    const err = screen.getByText("firstName is required"); // FLD-2: NOT "First name is required"
    expectSlot(err, "field-error");
    expect(err).not.toHaveAttribute("match"); // v2's plain <div> leaked it
    expect(err.className).toContain("text-destructive-foreground");
    expect(err.className).toContain("text-xs"); // FLD-3: no size prop, and the base is text-xs
    expect(err.className).not.toContain("text-sm");
  });
  it("primitives are bare; variants are the base's", () => {
    render(<FieldPrimitive data-testid="p" />);
    expect(screen.getByTestId("p").className).toBe("");
    render(
      <Field>
        <FieldControl />
        <FieldErrorPrimitive data-testid="ep" match={true}>
          zipCode invalid
        </FieldErrorPrimitive>
      </Field>,
    );
    const ep = screen.getByTestId("ep");
    expect(ep.className).toBe("");
    expect(ep).toHaveTextContent("zipCode invalid");
    expect(screen.queryByText("Zip code invalid")).toBeNull();
    expect(fieldVariants()).toContain("items-start");
    expect(fieldVariants()).not.toContain("space-y-2");
    expect(fieldErrorVariants()).toContain("text-destructive-foreground");
  });
  it("FLD-3 / FLD-5 are off the types", () => {
    // @ts-expect-error `centered` was dropped with FLD-5 — use className="items-center".
    render(<Field centered={true} />);
    render(
      <Field>
        {/* @ts-expect-error `variant`/`size` were dropped with FLD-3; they were copy-pasted from form-root-error. */}
        <FieldError match={true} size="sm" variant="card">
          x
        </FieldError>
      </Field>,
    );
  });
});
