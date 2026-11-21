import { act } from "react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
} from "../../../src/components/combobox/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

// `combobox` is one of the largest rewritten leaves and one of the fourteen
// the size-ramp hold-back names, so it is worth a behavioural witness as well
// as the class comparison against `.coss-base/combobox.tsx`.
describe("Combobox (coss base, CBX-7/SCR-1)", () => {
  const items = ["Alpha", "Beta", "Gamma"];

  function Picker() {
    return (
      <Combobox defaultOpen={true} items={items}>
        <ComboboxInput placeholder="Pick one" />
        <ComboboxPopup>
          <ComboboxList>
            {(item: string) => <ComboboxItem key={item}>{item}</ComboboxItem>}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    );
  }

  it("renders the popup and every item with the coss data-slots", async () => {
    render(<Picker />);
    const input = screen.getByPlaceholderText("Pick one");
    expectSlot(input, "combobox-input");
    expectSlot(
      document.querySelector("[data-slot=combobox-popup]"),
      "combobox-popup",
    );
    // SCR-1/CBX-7: the list is driven through a scroll area, not a bare div.
    expect(document.querySelector("[data-slot=combobox-list]")).not.toBeNull();
    for (const item of items)
      expect(
        screen.getByText(item).closest("[data-slot=combobox-item]"),
      ).not.toBeNull();
  });

  it("a11y: the icon-only trigger has a default accessible name, overridable", () => {
    const first = render(
      <Combobox items={items}>
        <ComboboxTrigger />
      </Combobox>,
    );
    expect(screen.getByRole("combobox").getAttribute("aria-label")).toBe(
      "Toggle options",
    );
    first.unmount();
    render(
      <Combobox items={items}>
        <ComboboxTrigger aria-label="Show fruits" />
      </Combobox>,
    );
    expect(
      screen.getByRole("combobox", { name: "Show fruits" }),
    ).not.toBeNull();
  });
  it("CBX-8: the popup frame animates open and closed from the popup's starting/ending style", () => {
    render(<Picker />);
    // Base UI marks Combobox.Popup; the visual classes sit on the frame <span>
    // around it, so the frame reacts through `has-` variants (the older coss
    // shape did this; the current base dropped the rules).
    const popup = document.querySelector("[data-slot=combobox-popup]");
    const frame = popup?.parentElement;
    expect(frame?.tagName).toBe("SPAN");
    expect(frame?.className).toContain("transition-[scale,opacity]");
    expect(frame?.className).toContain("has-data-starting-style:scale-98");
    expect(frame?.className).toContain("has-data-starting-style:opacity-0");
    expect(frame?.className).toContain("has-data-ending-style:scale-98");
    expect(frame?.className).toContain("has-data-ending-style:opacity-0");
  });
  it("filters to the typed query", async () => {
    render(<Picker />);
    const input = screen.getByPlaceholderText("Pick one") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: "Bet" } });
    });
    expect(screen.queryByText("Beta")).not.toBeNull();
    expect(screen.queryByText("Gamma")).toBeNull();
  });
});
