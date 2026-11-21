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

// WCAG 2.5.3 (Label in Name), enforced by axe's `label-content-name-mismatch`
// from 4.14: a day button shows "1", so its accessible name must contain "1" as
// a word. The day picker's default English name is "Sunday, November 1st, 2026".
describe("Calendar day-button names contain the visible day number", () => {
  const NOVEMBER = new Date(2026, 10, 15);
  const dayButton = (text: string) =>
    screen
      .getAllByText(text)
      .map((el) => el.closest("button"))
      .find((b) => b?.closest("[data-outside]") === null);

  it("drops the English ordinal: the 1st, 2nd, 3rd and 22nd are named 1, 2, 3 and 22", () => {
    render(<Calendar defaultMonth={NOVEMBER} mode="single" />);
    expect(dayButton("1")?.getAttribute("aria-label")).toBe(
      "Sunday, November 1, 2026",
    );
    expect(dayButton("2")?.getAttribute("aria-label")).toBe(
      "Monday, November 2, 2026",
    );
    expect(dayButton("3")?.getAttribute("aria-label")).toBe(
      "Tuesday, November 3, 2026",
    );
    expect(dayButton("22")?.getAttribute("aria-label")).toBe(
      "Sunday, November 22, 2026",
    );
  });

  it("keeps the day picker's selected suffix, and a consumer's own label still wins", () => {
    const { unmount } = render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="single"
        selected={new Date(2026, 10, 4)}
      />,
    );
    expect(dayButton("4")?.getAttribute("aria-label")).toBe(
      "Wednesday, November 4, 2026, selected",
    );
    unmount();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        labels={{ labelDayButton: (date) => `Day ${date.getDate()}` }}
        mode="single"
      />,
    );
    expect(dayButton("4")?.getAttribute("aria-label")).toBe("Day 4");
  });

  it("leaves a locale alone when its long date already has the number as a word", async () => {
    const { de, fr } = await import("@daypicker/react/locale");
    const { unmount } = render(
      <Calendar defaultMonth={NOVEMBER} locale={de} mode="single" />,
    );
    // German writes "1." — the number is already a word of its own.
    expect(dayButton("1")?.getAttribute("aria-label")).toBe(
      "Sonntag, 1. November 2026",
    );
    unmount();
    render(<Calendar defaultMonth={NOVEMBER} locale={fr} mode="single" />);
    // French already uses the plain number too.
    expect(dayButton("1")?.getAttribute("aria-label")).toBe(
      "dimanche 1 novembre 2026",
    );
    expect(dayButton("2")?.getAttribute("aria-label")).toBe(
      "lundi 2 novembre 2026",
    );
  });
});
