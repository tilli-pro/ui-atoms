import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { useState } from "react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CurrencyInput } from "../../../src/components/currency-input/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

/** What `Intl` renders for a pair, so the expectation is not an ICU snapshot. */
const money = (
  value: number,
  currency: string,
  locale: Intl.LocalesArgument = "en-US",
) =>
  new Intl.NumberFormat(locale as string | string[], {
    style: "currency",
    currency,
  }).format(value);

describe("CurrencyInput (CUR-1 — re-authored on number-field)", () => {
  it("formats through the primitive's `format`/`locale`, and defaults to USD", () => {
    const { container } = render(
      <CurrencyInput
        defaultValue={1234.5}
        inputProps={{ "aria-label": "amount" }}
        locale="en-US"
      />,
    );
    const input = screen.getByRole("textbox", { name: "amount" });
    expect(input).toHaveValue(money(1234.5, "USD"));
    // A preset, not a new part: every slot stays number-field's, so styles
    // that key on them (the group separator's focus ring) keep applying.
    expectSlot(
      container.querySelector("[data-slot=number-field]"),
      "number-field",
    );
    expectSlot(
      container.querySelector("[data-slot=number-field-group]"),
      "number-field-group",
    );
    expectSlot(input, "number-field-input");
    // A currency field is a plain input group: no steppers unless the caller
    // composes them from `./number-field` itself.
    expect(
      container.querySelector("[data-slot=number-field-increment]"),
    ).toBeNull();
    expect(
      container.querySelector("[data-slot=number-field-decrement]"),
    ).toBeNull();
  });

  it("honours `currency` and `locale`", () => {
    render(
      <CurrencyInput
        currency="EUR"
        defaultValue={1234.5}
        inputProps={{ "aria-label": "euros" }}
        locale="de-DE"
      />,
    );
    expect(screen.getByRole("textbox", { name: "euros" })).toHaveValue(
      money(1234.5, "EUR", "de-DE"),
    );
  });

  it("merges the caller's other `format` options", () => {
    render(
      <CurrencyInput
        defaultValue={1234.5}
        format={{ maximumFractionDigits: 0 }}
        inputProps={{ "aria-label": "whole" }}
        locale="en-US"
      />,
    );
    expect(screen.getByRole("textbox", { name: "whole" })).toHaveValue(
      new Intl.NumberFormat("en-US", {
        currency: "USD",
        maximumFractionDigits: 0,
        style: "currency",
      }).format(1234.5),
    );
  });

  it("is controlled by `value`, and `onValueChange` reports a number", () => {
    const seen: (number | null)[] = [];
    function Controlled() {
      const [value, setValue] = useState<number | null>(10);
      return (
        <>
          <CurrencyInput
            inputProps={{ "aria-label": "controlled" }}
            locale="en-US"
            onValueChange={(next) => {
              seen.push(next);
              setValue(next);
            }}
            value={value}
          />
          <output>{String(value)}</output>
        </>
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("textbox", { name: "controlled" });
    expect(input).toHaveValue(money(10, "USD"));
    fireEvent.change(input, { target: { value: "42" } });
    expect(seen).toEqual([42]);
    expect(screen.getByRole("status")).toHaveTextContent("42");
    fireEvent.blur(input);
    expect(input).toHaveValue(money(42, "USD"));
  });

  it("does not move while `value` is pinned by the parent", () => {
    const onValueChange = vi.fn();
    render(
      <CurrencyInput
        inputProps={{ "aria-label": "pinned" }}
        locale="en-US"
        onValueChange={onValueChange}
        value={7}
      />,
    );
    const input = screen.getByRole("textbox", { name: "pinned" });
    fireEvent.change(input, { target: { value: "9" } });
    expect(onValueChange).toHaveBeenCalledWith(9, expect.anything());
    fireEvent.blur(input);
    expect(input).toHaveValue(money(7, "USD"));
  });

  it("`min`/`max` reach the primitive and clamp stepping", () => {
    const { container } = render(
      <CurrencyInput
        defaultValue={5}
        inputProps={{ "aria-label": "capped" }}
        locale="en-US"
        max={5}
        min={0}
        name="capped"
      />,
    );
    const hidden = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    expect(hidden).toHaveAttribute("min", "0");
    expect(hidden).toHaveAttribute("max", "5");
    const input = screen.getByRole("textbox", { name: "capped" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue(money(5, "USD"));
    expect(hidden).toHaveValue(5);
  });

  it("`name` submits the numeric value, not the formatted string", () => {
    render(
      <form data-testid="form">
        <CurrencyInput
          defaultValue={12.5}
          inputProps={{ "aria-label": "total" }}
          name="amount"
        />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("amount")).toBe("12.5");
  });

  it("accepts an amount with cents in a form that sets `min`", () => {
    // The primitive's default step of 1 makes 12.50 a step mismatch as soon
    // as `min` gives the browser a step base.
    render(
      <form data-testid="cents">
        <CurrencyInput defaultValue={12.5} min={0} name="amount" />
      </form>,
    );
    const form = screen.getByTestId("cents") as HTMLFormElement;
    expect(form.checkValidity()).toBe(true);
  });

  it("passes `step` through when the caller sets one", () => {
    const { container } = render(
      <CurrencyInput defaultValue={1} name="amount" step={0.5} />,
    );
    expect(container.querySelector('input[type="number"]')).toHaveAttribute(
      "step",
      "0.5",
    );
  });

  it("formats in the runtime locale when none is given", () => {
    render(
      <CurrencyInput defaultValue={5} inputProps={{ "aria-label": "here" }} />,
    );
    expect(screen.getByRole("textbox", { name: "here" })).toHaveValue(
      new Intl.NumberFormat(undefined, {
        currency: "USD",
        style: "currency",
      }).format(5),
    );
  });

  it("does not offer `format` keys it would ignore", () => {
    render(
      <CurrencyInput
        defaultValue={1}
        // @ts-expect-error -- the currency comes from `currency`, the style is fixed
        format={{ currency: "EUR", style: "percent" }}
        inputProps={{ "aria-label": "typed" }}
        locale="en-US"
      />,
    );
    expect(screen.getByRole("textbox", { name: "typed" })).toHaveValue(
      money(1, "USD"),
    );
  });

  it("passes the rest of the root's contract straight through", () => {
    const { container } = render(
      <CurrencyInput
        className="max-w-40"
        disabled={true}
        inputProps={{ "aria-label": "off" }}
        required={true}
        size="sm"
      />,
    );
    const root = container.querySelector(
      "[data-slot=number-field]",
    ) as HTMLElement;
    expect(root.className).toContain("max-w-40");
    expect(root).toHaveAttribute("data-size", "sm");
    expect(root).toHaveAttribute("data-disabled");
    expect(screen.getByRole("textbox", { name: "off" })).toBeDisabled();
    expect(container.querySelector('input[type="number"]')).toBeRequired();
  });
});

describe("the dropped optional peer", () => {
  it("survives only as prose: no import, no dependency entry, no lock record", () => {
    // CUR-1 dropped `react-currency-input-field` outright, so the name must be
    // gone from every place that could re-create the dependency edge: the
    // component, the peer / optional-peer / dev entries, the catalog, the
    // lockfile, the use-client audit's client-only list and the install table.
    // Up to three files may still say it, each a record of the removal rather than
    // a use of the package; the upgrade notes are not in every tree.
    const root = resolve(import.meta.dirname, "..", "..", "..", "..", "..");
    const prose = [
      "docs/migration-from-tillix-ui-atoms.md", // upgrade notes, where present
      "scripts/coss/manifest.ts", // the CUR-1 decision record and its `drops`
      "packages/ui-atoms/__tests__/components/currency-input/index.test.tsx", // this file
    ];
    let hits = "";
    try {
      hits = execFileSync(
        "git",
        [
          "-C",
          root,
          "grep",
          "-l",
          "-F",
          "react-currency-input-field",
          "--",
          ".",
          ...prose.map((path) => `:(exclude)${path}`),
        ],
        { encoding: "utf8" },
      );
    } catch {
      hits = ""; // `git grep` exits 1 when nothing matches, which is the pass.
    }
    expect(hits.trim().split("\n").filter(Boolean)).toEqual([]);
  });
});
