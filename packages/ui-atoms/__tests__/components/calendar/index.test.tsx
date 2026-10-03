import { describe, expect, it } from "vitest";
import { Calendar } from "../../../src/components/calendar/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

// Dependency swap: react-aria-components + @internationalized/date → coss's
// DayPicker calendar, and `Calendar` + `RangeCalendar` collapse into one
// `mode`-driven component. This is the witness that the swap renders at all.
describe("Calendar (DayPicker swap)", () => {
  it("renders a month grid with the coss data-slot", () => {
    const { container } = render(
      <Calendar defaultMonth={new Date(2026, 0, 15)} mode="single" />,
    );
    expectSlot(container.querySelector("[data-slot=calendar]"), "calendar");
    expect(screen.getByRole("grid")).toBeTruthy();
    // 2026-01-15 is a Thursday; the 15th is in the rendered month.
    expect(screen.getByText("15")).toBeTruthy();
  });

  it("a11y: weekday header and day buttons carry full-strength muted-foreground for the outside-month variant, not /72 — 2.81:1 against white failed axe color-contrast (in-data-disabled keeps /72: WCAG exempts inactive-control text)", () => {
    render(<Calendar defaultMonth={new Date(2026, 0, 15)} mode="single" />);
    const weekday = document.querySelector('[data-slot="calendar"] th');
    expect(weekday?.className).not.toContain("text-muted-foreground/72");
    expect(weekday?.className).toContain("text-muted-foreground");
    const dayButton = screen.getByText("15").closest("button");
    expect(dayButton?.className).toContain(
      "in-data-outside:text-muted-foreground ",
    );
    expect(dayButton?.className).not.toContain(
      "in-data-outside:text-muted-foreground/72",
    );
    expect(dayButton?.className).toContain(
      "in-data-disabled:text-muted-foreground/72",
    );
  });
  it('accepts mode="range" — the collapsed RangeCalendar', () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 0, 15)}
        mode="range"
        selected={{
          from: new Date(2026, 0, 10),
          to: new Date(2026, 0, 12),
        }}
      />,
    );
    const selected = document.querySelectorAll("[data-selected]");
    expect(selected.length).toBeGreaterThan(0);
  });
});
