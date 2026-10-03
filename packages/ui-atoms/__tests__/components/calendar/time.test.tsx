import { act } from "react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, type Mock, vi } from "vitest";
import {
  Calendar,
  CalendarTime,
  CalendarTimePrimitive,
  calendarTimeVariants,
} from "../../../src/components/calendar/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

const JAN_15 = new Date(2026, 0, 15);
const AT_0930 = new Date(2026, 0, 15, 9, 30);

interface TimeOptions {
  className?: string;
  defaultMonth?: Date;
  disabled?: boolean | { after: Date };
  onSelect?: Mock;
  selected?: Date;
  timeProps?: { disabled?: boolean; label?: string };
  timeZone?: string;
}

/** A single-date Calendar on January 2026 with the time field on. */
function renderTime({ defaultMonth = JAN_15, ...rest }: TimeOptions = {}) {
  return render(
    <Calendar
      defaultMonth={defaultMonth}
      mode="single"
      showTime={true}
      {...rest}
    />,
  );
}

/** The button of an in-month day cell, found by its ISO date. */
function dayButton(iso: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(
    `[data-day="${iso}"]:not([data-outside]) button`,
  );
  if (!button) throw new Error(`no day button for ${iso}`);
  return button;
}

/** The time field's input, found by its accessible name. */
function timeInput(name = "Time"): HTMLInputElement {
  return screen.getByRole("combobox", { name }) as HTMLInputElement;
}

async function enter(input: HTMLInputElement, text: string) {
  await act(async () => {
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: text } });
  });
}

async function leave(input: HTMLInputElement) {
  await act(async () => {
    fireEvent.blur(input);
  });
}

async function press(element: HTMLElement) {
  await act(async () => {
    fireEvent.click(element);
  });
}

/** The last value a spy was called with, which must be a Date. */
function lastDate(spy: Mock): Date {
  const value = spy.mock.lastCall?.[0];
  if (!(value instanceof Date)) throw new Error("no Date was reported");
  return value;
}

/** Local wall-clock parts: year, month, day, hours, minutes, seconds, milliseconds. */
const parts = (date: Date) => [
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
  date.getSeconds(),
  date.getMilliseconds(),
];

const selectedCell = (iso: string) =>
  document.querySelector(`[data-day="${iso}"]`)?.hasAttribute("data-selected");

describe("Calendar without showTime", () => {
  it("renders the day picker alone, as before", () => {
    const { container } = render(
      <Calendar defaultMonth={JAN_15} mode="single" showTime={false} />,
    );
    expectSlot(container.firstElementChild, "calendar");
    expect(
      container.querySelector("[data-slot=calendar-with-time]"),
    ).toBeNull();
    expect(container.querySelector("[data-slot=calendar-time]")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});

describe("Calendar with showTime", () => {
  it("renders the time field beside the day picker, outside its live regions", () => {
    const { container } = renderTime({ className: "rounded-lg border" });
    const wrapper = container.firstElementChild;
    expectSlot(wrapper, "calendar-with-time");
    expect(wrapper.className).toContain("rounded-lg border");
    expect(wrapper.children).toHaveLength(2);
    const picker = wrapper.children.item(0);
    const time = wrapper.children.item(1);
    expectSlot(picker, "calendar");
    expectSlot(time, "calendar-time");
    expect(picker.className).not.toContain("rounded-lg");
    // A field in the picker's footer would sit in a polite live region and be
    // announced rather than operated; this one is a sibling of the picker.
    expect(timeInput().closest("[data-slot=calendar]")).toBeNull();
    expect(timeInput().closest("[aria-live], [role=status]")).toBeNull();
  });

  it("names the time input by its visible label, which timeProps can replace", () => {
    const first = renderTime();
    expect(timeInput("Time").hasAttribute("aria-label")).toBe(false);
    first.unmount();
    renderTime({ timeProps: { label: "Start time" } });
    expect(timeInput("Start time")).toBeTruthy();
  });

  it("shows the selected value's time on a 24-hour clock", () => {
    renderTime({ selected: new Date(2026, 0, 15, 14, 5) });
    expect(timeInput().value).toBe("14:05");
  });

  it("keeps the time when a day is picked", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect, selected: AT_0930 });
    await press(dayButton("2026-01-20"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 20, 9, 30, 0, 0]);
  });

  it("keeps the day when a time is entered, and reports it once", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect, selected: AT_0930 });
    await enter(timeInput(), "1745");
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 15, 17, 45, 0, 0]);
    await leave(timeInput());
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("drops seconds and milliseconds", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect, selected: new Date(2026, 0, 15, 9, 30, 45, 500) });
    expect(timeInput().value).toBe("09:30");
    await press(dayButton("2026-01-20"));
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 20, 9, 30, 0, 0]);
  });

  it("holds a time entered before any day and applies it to the day picked next", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect });
    expect(timeInput().value).toBe("");
    await enter(timeInput(), "0815");
    await leave(timeInput());
    expect(onSelect).not.toHaveBeenCalled();
    await press(dayButton("2026-01-20"));
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 20, 8, 15, 0, 0]);
  });

  it("gives a day picked before any time the start of that day", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect });
    await press(dayButton("2026-01-20"));
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 20, 0, 0, 0, 0]);
  });

  it("keeps its own value when uncontrolled", async () => {
    renderTime();
    await press(dayButton("2026-01-20"));
    expect(timeInput().value).toBe("00:00");
    await enter(timeInput(), "1100");
    await leave(timeInput());
    await press(dayButton("2026-01-25"));
    expect(timeInput().value).toBe("11:00");
    expect(selectedCell("2026-01-25")).toBe(true);
  });

  it("keeps the time for the next day when the selected day is cleared", async () => {
    renderTime({ selected: AT_0930 });
    await press(dayButton("2026-01-15"));
    expect(selectedCell("2026-01-15")).toBe(false);
    expect(timeInput().value).toBe("09:30");
    await press(dayButton("2026-01-20"));
    expect(timeInput().value).toBe("09:30");
    expect(selectedCell("2026-01-20")).toBe(true);
  });

  it("accepts a time typed without the colon or with a one-digit hour", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect, selected: new Date(2026, 0, 15, 12, 0) });
    await enter(timeInput(), "930");
    expect(timeInput().value).toBe("9:30");
    expect(onSelect).not.toHaveBeenCalled();
    await leave(timeInput());
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 15, 9, 30, 0, 0]);
    await enter(timeInput(), "7");
    await leave(timeInput());
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 15, 7, 0, 0, 0]);
  });

  it("is a 24-hour field: letters cannot be typed, so 2:30 pm reads as 02:30", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect, selected: AT_0930 });
    await enter(timeInput(), "2:30 pm");
    expect(timeInput().value).toBe("2:30");
    await leave(timeInput());
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 15, 2, 30, 0, 0]);
    await enter(timeInput(), "1430");
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 15, 14, 30, 0, 0]);
  });

  it("accepts 00:00 and 23:59, rejects 24:00 and 12:60 and restores the last time", async () => {
    const onSelect = vi.fn();
    renderTime({ onSelect, selected: AT_0930 });
    await enter(timeInput(), "2400");
    await leave(timeInput());
    expect(timeInput().value).toBe("09:30");
    await enter(timeInput(), "1260");
    await leave(timeInput());
    expect(timeInput().value).toBe("09:30");
    expect(onSelect).not.toHaveBeenCalled();
    await enter(timeInput(), "0000");
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 15, 0, 0, 0, 0]);
    await enter(timeInput(), "2359");
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 15, 23, 59, 0, 0]);
  });

  it("disables the field with the whole calendar or on its own, but not for a day matcher", async () => {
    const whole = renderTime({ disabled: true });
    expect(timeInput()).toBeDisabled();
    expect(dayButton("2026-01-20")).toBeDisabled();
    whole.unmount();
    const own = renderTime({ timeProps: { disabled: true } });
    expect(timeInput()).toBeDisabled();
    expect(dayButton("2026-01-20")).not.toBeDisabled();
    own.unmount();
    const onSelect = vi.fn();
    renderTime({
      disabled: { after: new Date(2026, 0, 20) },
      onSelect,
      selected: AT_0930,
    });
    expect(timeInput()).not.toBeDisabled();
    await press(dayButton("2026-01-25"));
    expect(onSelect).not.toHaveBeenCalled();
    await press(dayButton("2026-01-20"));
    expect(parts(lastDate(onSelect))).toEqual([2026, 0, 20, 9, 30, 0, 0]);
  });

  it("reads and writes the time in timeZone, and reports a plain Date", async () => {
    // 00:30 UTC is 09:30 on 15 January in Tokyo (UTC+9, no daylight saving).
    // A zoned date would print its offset from toISOString; a plain Date prints Z.
    const at = new Date(Date.UTC(2026, 0, 15, 0, 30));
    const onSelect = vi.fn();
    renderTime({
      defaultMonth: at,
      onSelect,
      selected: at,
      timeZone: "Asia/Tokyo",
    });
    expect(timeInput().value).toBe("09:30");
    await press(dayButton("2026-01-20"));
    expect(lastDate(onSelect).toISOString()).toBe("2026-01-20T00:30:00.000Z");
    await enter(timeInput(), "2345");
    expect(lastDate(onSelect).toISOString()).toBe("2026-01-15T14:45:00.000Z");
  });

  it("moves a time inside a daylight-saving gap forward, as the platform does", async () => {
    // 05:00 UTC is midnight on 8 March 2026 in New York; clocks skip from 02:00 to 03:00.
    const midnight = new Date(Date.UTC(2026, 2, 8, 5, 0));
    const onSelect = vi.fn();
    renderTime({
      defaultMonth: midnight,
      onSelect,
      selected: midnight,
      timeZone: "America/New_York",
    });
    expect(timeInput().value).toBe("00:00");
    await enter(timeInput(), "0230");
    expect(lastDate(onSelect).toISOString()).toBe("2026-03-08T07:30:00.000Z");
  });

  it("types: the time field is for single-date selection", () => {
    const report = (value: Date | undefined) => value;
    const flag = JAN_15.getDate() === 15;
    const single = <Calendar mode="single" onSelect={report} showTime={true} />;
    const conditional = <Calendar onSelect={report} showTime={flag} />;
    // @ts-expect-error a range has two ends, and one time field cannot serve both
    const range = <Calendar mode="range" showTime={true} />;
    // @ts-expect-error several days cannot share one time field
    const multiple = <Calendar mode="multiple" showTime={true} />;
    expect([single, conditional, range, multiple]).toHaveLength(4);
  });
});

describe("CalendarTime", () => {
  it("is a styled field on its own: data-slot, variants, one report per entered time", async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <CalendarTime defaultValue="08:00" onValueChange={onValueChange} />,
    );
    const root = container.firstElementChild;
    expectSlot(root, "calendar-time");
    for (const cls of calendarTimeVariants().split(" "))
      expect(root.className).toContain(cls);
    expect(timeInput().value).toBe("08:00");
    await enter(timeInput(), "0915");
    await leave(timeInput());
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("09:15");
    expect(timeInput().value).toBe("09:15");
  });

  it("has a primitive with the data-slot and no classes of its own", () => {
    const { container } = render(
      <CalendarTimePrimitive defaultValue="08:00" />,
    );
    const root = container.firstElementChild;
    expectSlot(root, "calendar-time");
    expect(root.className).toBe("");
    expect(timeInput().value).toBe("08:00");
  });

  it("follows value when controlled, and returns to it when the owner does not move", async () => {
    const onValueChange = vi.fn();
    render(<CalendarTime onValueChange={onValueChange} value="08:00" />);
    await enter(timeInput(), "0915");
    expect(onValueChange).toHaveBeenCalledWith("09:15");
    await leave(timeInput());
    expect(timeInput().value).toBe("08:00");
  });
});
