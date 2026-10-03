import { describe, expect, it } from "vitest";
import {
  OTPField,
  OTPFieldInput,
  OTPFieldSeparator,
} from "../../../src/components/otp-field/index.js";
import { expectSlot, render } from "../../helpers/render.js";

// Dependency swap: `input-otp` → `@base-ui/react/otp-field`; the directory,
// the subpath and the part names all became `otp-field`/`OTPField*`.
describe("OTPField (@base-ui/react/otp-field swap)", () => {
  it("renders one input per slot and mirrors `size` onto data-size", () => {
    const { container } = render(
      <OTPField defaultValue="12" length={3} size="lg">
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldSeparator />
        <OTPFieldInput />
      </OTPField>,
    );
    const root = container.querySelector("[data-slot=otp-field]");
    expectSlot(root, "otp-field");
    expect(root.getAttribute("data-size")).toBe("lg");
    const inputs = container.querySelectorAll("[data-slot=otp-field-input]");
    expect(inputs.length).toBe(3);
    expect((inputs[0] as HTMLInputElement).value).toBe("1");
    expect((inputs[1] as HTMLInputElement).value).toBe("2");
    // `OTPFieldSeparator` renders through our `Separator`, so it carries that
    // part's slot rather than an otp-specific one.
    expect(container.querySelector("[data-slot=separator]")).not.toBeNull();
  });
});
