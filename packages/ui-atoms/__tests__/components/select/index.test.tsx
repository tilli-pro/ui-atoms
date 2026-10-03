import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Field, FieldLabel } from "../../../src/components/field/index.js";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectTriggerPrimitive,
  SelectValue,
  selectItemVariants,
  selectScrollArrowVariants,
  selectTriggerVariants,
} from "../../../src/components/select/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

const items = [
  { label: "One", value: "one" },
  { label: "Two", value: "two" },
];

const ARIA_LABELLEDBY_ATTR_RE = /aria-labelledby="([^"]+)"/;

describe("Select family", () => {
  it("trigger: slot, size variant classes and the chevron icon", () => {
    render(
      <Select items={items}>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expectSlot(trigger, "select-trigger");
    expect(trigger.className).toContain("min-w-36");
    expect(trigger.className).toContain("gap-1.5");
    expect(trigger.querySelector('[data-slot="select-icon"]')).not.toBeNull();
  });
  it("open popup renders positioner/popup/list/items/group/separator with slots", async () => {
    render(
      <Select defaultValue="one" items={items} open={true}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          <SelectGroup>
            <SelectGroupLabel>G</SelectGroupLabel>
            <SelectItem value="one">One</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="two">Two</SelectItem>
        </SelectPopup>
      </Select>,
    );
    const list = await screen.findByRole("listbox");
    expectSlot(list, "select-list");
    expect(
      document.querySelector('[data-slot="select-positioner"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-slot="select-popup"]')).not.toBeNull();
    // ScrollUpArrow/ScrollDownArrow mount only when the list is scrollable (keepMounted=false) — never in jsdom.
    expect(
      document.querySelector('[data-slot="select-scroll-up-arrow"]'),
    ).toBeNull();
    expect(selectScrollArrowVariants({ direction: "up" })).toContain("top-0");
    const two = screen.getByRole("option", { name: "Two" });
    expectSlot(two, "select-item");
    expect(two.className).toContain("grid-cols-[1rem_minmax(0,1fr)]");
    expectSlot(
      document.querySelector('[data-slot="select-group"]'),
      "select-group",
    );
    expectSlot(screen.getByText("G"), "select-group-label");
    expectSlot(
      document.querySelector('[data-slot="select-separator"]'),
      "select-separator",
    );
  });
  it("a11y: trigger gets aria-labelledby pointing at its SelectValue child — role=combobox has nameFrom:author, so axe's button-name check ignores visible text content", () => {
    render(
      <Select items={items}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    const labelledBy = trigger.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    const labelEl = document.getElementById(labelledBy as string);
    expectSlot(labelEl, "select-value");
    expect(labelEl.textContent).toBe("Select an option");
  });
  it("a11y: an explicit aria-label on the trigger wins — no generated aria-labelledby", () => {
    render(
      <Select items={items}>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-label")).toBe("Country");
    expect(trigger.getAttribute("aria-labelledby")).toBeNull();
  });
  it("a11y: a FieldLabel's real id labels the trigger — the generated fallback never overrides it", () => {
    render(
      <Field>
        <FieldLabel>Country</FieldLabel>
        <Select items={items}>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
        </Select>
      </Field>,
    );
    const trigger = screen.getByRole("combobox");
    const labelledBy = trigger.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    const labelEl = document.getElementById(labelledBy as string);
    expect(labelEl?.textContent).toBe("Country");
    // Not the SelectValue's own id/text — the real label, not the fallback.
    expect(labelEl?.textContent).not.toBe("Select a country");
  });
  it("a11y: a SelectLabel's real id labels the trigger — the generated fallback never overrides it", () => {
    render(
      <Select items={items}>
        <SelectLabel>Country</SelectLabel>
        <SelectTrigger>
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    const labelledBy = trigger.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    const labelEl = document.getElementById(labelledBy as string);
    expect(labelEl?.textContent).toBe("Country");
    expect(labelEl?.textContent).not.toBe("Select a country");
  });
  it("a11y (SSR): the fallback aria-labelledby is present in the server-rendered HTML itself, not only after an effect runs — RTL's render() flushes effects via act() before any assertion, so it cannot see this; renderToStaticMarkup runs no effects at all, exactly like a real SSR pass before hydration", () => {
    const html = renderToStaticMarkup(
      <Select items={items}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>,
    );
    const labelledByMatch = html.match(ARIA_LABELLEDBY_ATTR_RE);
    expect(labelledByMatch).not.toBeNull();
    const id = (labelledByMatch as RegExpMatchArray)[1];
    // The id the trigger points at is present on the SelectValue span in the
    // same static markup, carrying the right fallback text — not merely a
    // dangling reference that resolves only once the client mounts.
    expect(html).toContain(`id="${id}"`);
    const valueSpanMatch = html.match(
      new RegExp(`<span[^>]*id="${id}"[^>]*>([^<]*)</span>`),
    );
    expect(valueSpanMatch).not.toBeNull();
    expect((valueSpanMatch as RegExpMatchArray)[1]).toBe("Select an option");
  });
  it("a11y (SSR): an explicit aria-label on the trigger is present in the server-rendered HTML too — no generated aria-labelledby is ever emitted for it to conflict with", () => {
    const html = renderToStaticMarkup(
      <Select items={items}>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
      </Select>,
    );
    expect(html).toContain('aria-label="Country"');
    expect(html).not.toContain("aria-labelledby");
  });
  it("primitive trigger has no classes; variants exported with the size keys", () => {
    render(
      <Select items={items}>
        <SelectTriggerPrimitive>t</SelectTriggerPrimitive>
      </Select>,
    );
    expect(screen.getByRole("combobox").className).toBe("");
    expect(selectTriggerVariants({ size: "lg" })).toContain("min-h-9");
    expect(selectTriggerVariants()).not.toContain("min-h-9");
    expect(selectItemVariants()).toContain("data-highlighted:bg-accent");
  });
});
