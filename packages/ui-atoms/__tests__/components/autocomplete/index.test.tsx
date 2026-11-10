import { describe, expect, it } from "vitest";
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "../../../src/components/autocomplete/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Autocomplete (coss base)", () => {
  const items = ["Alpha", "Beta", "Gamma"];

  it("ACP-2: the popup frame animates open and closed from the popup's starting/ending style", () => {
    render(
      <Autocomplete defaultOpen={true} items={items}>
        <AutocompleteInput placeholder="Search" />
        <AutocompletePopup>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>,
    );
    expectSlot(screen.getByPlaceholderText("Search"), "autocomplete-input");
    // Base UI marks Autocomplete.Popup; the visual classes sit on the frame
    // <span> around it, so the frame reacts through `has-` variants (the older
    // coss shape did this; the current base dropped the rules).
    const popup = document.querySelector("[data-slot=autocomplete-popup]");
    expect(popup).not.toBeNull();
    const frame = popup?.parentElement;
    expect(frame?.tagName).toBe("SPAN");
    expect(frame?.className).toContain("transition-[scale,opacity]");
    expect(frame?.className).toContain("has-data-starting-style:scale-98");
    expect(frame?.className).toContain("has-data-starting-style:opacity-0");
    expect(frame?.className).toContain("has-data-ending-style:scale-98");
    expect(frame?.className).toContain("has-data-ending-style:opacity-0");
  });
});
