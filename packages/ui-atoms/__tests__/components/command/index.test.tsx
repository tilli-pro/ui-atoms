import { act } from "react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
} from "../../../src/components/command/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

// Dependency swap: `cmdk` → coss's Base UI Autocomplete command palette (and
// with it `multi-select` goes away — `MSL-1`). One filtering render is the
// witness that the replacement actually filters.
describe("Command (Base UI Autocomplete swap)", () => {
  const items = ["Open file", "Open folder", "Close window"];

  function Palette() {
    return (
      <Command items={items}>
        <CommandInput placeholder="Search" />
        <CommandPanel>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandList>
            {(item: string) => <CommandItem key={item}>{item}</CommandItem>}
          </CommandList>
        </CommandPanel>
      </Command>
    );
  }

  it("renders every item with the command data-slots", () => {
    render(<Palette />);
    // `CommandInput` wraps `AutocompleteInput` and keeps that part's slot —
    // the base gives a `command-*` slot only to the parts listed below.
    expectSlot(screen.getByPlaceholderText("Search"), "autocomplete-input");
    expectSlot(
      document.querySelector("[data-slot=command-list]"),
      "command-list",
    );
    for (const item of items)
      expectSlot(screen.getByText(item), "command-item");
  });

  it("filters the list as the query changes", async () => {
    const { rerender } = render(<Palette />);
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: "folder" } });
    });
    rerender(<Palette />);
    expect(screen.queryByText("Open folder")).not.toBeNull();
    expect(screen.queryByText("Close window")).toBeNull();
  });
});
