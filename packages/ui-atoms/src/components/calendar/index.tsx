"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { DayPicker, type PropsBase, TZDate } from "@daypicker/react";
import { cva } from "cva";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ClockIcon,
} from "lucide-react";
import { cn } from "../../utils.js";
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "../autocomplete/index.js";
import {
  FieldLabel,
  FieldPrimitive,
  type FieldPrimitiveProps,
} from "../field/index.js";

// CAL-1, swap 4 of 4: react-aria-components + @internationalized/date →
// `@daypicker/react` 10.0.1 (MIT). coss base `.coss-base/calendar.tsx`
// @8163481, with the size ramp collapsed to its `sm:` member. `months`'
// `flex-col sm:flex-row` is layout stacking, not half of a size pair, so it is
// copied as-is.
//
// Breaking surface for consumers migrating from the earlier component: `Calendar` and `RangeCalendar`
// collapse into one `mode`-driven `Calendar`, and the value type goes
// `CalendarDate` → native `Date`.
//
// CAL-2: optional time selection. With `showTime` the wrapper renders a
// 24-hour time field (`CalendarTime`) below the day picker, after coss's
// `p-calendar-25` particle, and keeps one `Date` value. The field is a sibling
// because the picker's `footer` is a polite live region (a field there is
// announced, not operated) and `components` only replaces the picker's own
// elements. `times`, `parseTime`, `formatTimeInput` and `filterTime` are that
// particle's, verbatim. Without `showTime` the day picker renders as before.

const calendarButtonVariants = cva({
  base: "relative flex size-(--cell-size) items-center justify-center rounded-lg text-foreground text-sm not-in-data-selected:hover:bg-accent disabled:pointer-events-none disabled:opacity-64 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

const calendarVariants = cva({
  base: "w-fit [--cell-size:--spacing(9)]",
});

const calendarTimeVariants = cva({
  base: "flex w-0 min-w-full flex-row items-center gap-3 *:data-[slot=field-label]:whitespace-nowrap *:data-[slot=field-label]:text-xs",
});

const times = Array.from({ length: 96 }, (_, i) => {
  const hours = String(Math.floor(i / 4)).padStart(2, "0");
  const minutes = String((i % 4) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
});

function parseTime(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const colonMatch = /^(\d{1,2}):(\d{1,2})$/.exec(trimmed);
  if (colonMatch) {
    const hours = Number(colonMatch[1]);
    const minutes = Number(colonMatch[2]);
    if (hours > 23 || minutes > 59) {
      return null;
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 0 || digits.length > 4) {
    return null;
  }

  let hours: number;
  let minutes: number;

  if (digits.length <= 2) {
    hours = Number(digits);
    minutes = 0;
  } else if (digits.length === 3) {
    // HMM → H:MM (215 → 02:15)
    hours = Number(digits[0]);
    minutes = Number(digits.slice(1));
  } else {
    // HHMM → HH:MM (2150 → 21:50)
    hours = Number(digits.slice(0, 2));
    minutes = Number(digits.slice(2));
  }

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Live input formatting from a digit buffer:
 * - ≤2 digits: as-is
 * - 3 digits: H:MM (unpadded hour so a 4th digit can still become HHMM)
 * - 4 digits: HH:mm
 */
function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length === 3) {
    const minutes = Number(digits.slice(1));
    if (minutes <= 59) {
      return `${digits[0]}:${digits.slice(1)}`;
    }
    return digits;
  }

  return parseTime(digits) ?? digits;
}

function filterTime(item: string, query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }

  if (item.toLowerCase().startsWith(trimmed)) {
    return true;
  }

  const itemDigits = item.replace(/\D/g, "");
  const queryDigits = trimmed.replace(/\D/g, "");
  if (!queryDigits) {
    return false;
  }

  const itemHour = Number(itemDigits.slice(0, 2));
  const itemMinutes = itemDigits.slice(2);
  // Padded "0615" and unpadded "615" so "61" matches 06:15 while typing toward 615
  const itemDigitsUnpadded = `${itemHour}${itemMinutes}`;

  if (
    itemDigits.startsWith(queryDigits) ||
    itemDigitsUnpadded.startsWith(queryDigits)
  ) {
    return true;
  }

  if (queryDigits.length >= 3) {
    const normalized = parseTime(queryDigits);
    return normalized === item;
  }

  const queryHour = Number(queryDigits);

  if (trimmed.includes(":")) {
    const minuteQuery = trimmed.split(":")[1]?.replace(/\D/g, "") ?? "";
    return (
      itemHour === queryHour &&
      (!minuteQuery || itemMinutes.startsWith(minuteQuery))
    );
  }

  if (queryDigits.length === 1) {
    return itemHour === queryHour || String(itemHour).startsWith(queryDigits);
  }

  return queryHour <= 23 && itemHour === queryHour;
}

type DayPickerProps = React.ComponentProps<typeof DayPicker>;

function CalendarDayPicker({
  className,
  classNames,
  components: userComponents,
  mode = "single",
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const buttonClassNames = calendarButtonVariants();

  const defaultClassNames = {
    button_next: buttonClassNames,
    button_previous: buttonClassNames,
    caption_label: "text-sm font-medium flex items-center gap-2 h-full",
    day: "size-(--cell-size) text-sm py-px",
    // a11y: `in-data-outside:text-muted-foreground/72` (the
    // previous/next-month days, still clickable) fell to 2.81:1 against the
    // white grid — dropped to full strength. `in-data-disabled:…/72` is left
    // at 72%: WCAG 1.4.3 exempts inactive-control text, and a real
    // `disabled`/`aria-disabled` day is exactly that.
    day_button: cn(
      buttonClassNames,
      "in-data-disabled:pointer-events-none in-[.range-middle]:rounded-none in-[.range-end:not(.range-start)]:rounded-s-none in-[.range-start:not(.range-end)]:rounded-e-none in-[.range-middle]:in-data-selected:bg-accent in-data-selected:bg-primary in-[.range-middle]:in-data-selected:text-foreground in-data-disabled:text-muted-foreground/72 in-data-outside:text-muted-foreground in-data-selected:in-data-outside:text-primary-foreground in-data-selected:text-primary-foreground in-data-disabled:line-through outline-none in-[[data-selected]:not(.range-middle)]:transition-[border-radius,box-shadow] focus-visible:z-1 focus-visible:ring-[3px] focus-visible:ring-ring/50",
    ),
    dropdown: "absolute bg-popover inset-0 opacity-0",
    dropdown_root:
      "relative has-focus:border-ring has-focus:ring-ring/50 has-focus:ring-[3px] border border-input shadow-xs/5 rounded-lg px-[calc(--spacing(3)-1px)] h-8 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-me-1",
    dropdowns:
      "w-full flex items-center text-sm justify-center h-(--cell-size) gap-1.5 *:[span]:font-medium",
    hidden: "invisible",
    month: "w-full",
    month_caption:
      "relative mx-(--cell-size) px-1 mb-1 flex h-(--cell-size) items-center justify-center z-2",
    months: "relative flex flex-col sm:flex-row gap-2",
    nav: "absolute top-0 flex w-full justify-between z-1",
    outside:
      "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    range_end: "range-end",
    range_middle: "range-middle",
    range_start: "range-start",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-1 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30",
    // a11y: same `/72` contrast defect as `day_button`'s outside
    // days — 2.81:1 against white, both are always-visible informational
    // text, not inactive controls, so both go to full strength.
    week_number:
      "size-(--cell-size) p-0 text-xs font-medium text-muted-foreground",
    weekday: "size-(--cell-size) p-0 text-xs font-medium text-muted-foreground",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(
    defaultClassNames,
  ).reduce(
    (acc, key) => {
      const userClass = classNames?.[key as keyof typeof classNames];
      const baseClass =
        defaultClassNames[key as keyof typeof defaultClassNames];

      acc[key as keyof typeof defaultClassNames] = userClass
        ? cn(baseClass, userClass)
        : baseClass;

      return acc;
    },
    { ...defaultClassNames } as typeof defaultClassNames,
  );

  const defaultComponents = {
    Chevron: ({
      className: chevronClassName,
      orientation,
      ...chevronProps
    }: {
      className?: string;
      orientation?: "down" | "left" | "right" | "up";
    }) => {
      if (orientation === "left") {
        return (
          <ChevronLeftIcon
            className={cn(chevronClassName, "rtl:rotate-180")}
            {...chevronProps}
            aria-hidden="true"
          />
        );
      }

      if (orientation === "right") {
        return (
          <ChevronRightIcon
            className={cn(chevronClassName, "rtl:rotate-180")}
            {...chevronProps}
            aria-hidden="true"
          />
        );
      }

      return (
        <ChevronsUpDownIcon
          className={chevronClassName}
          {...chevronProps}
          aria-hidden="true"
        />
      );
    },
  };

  const dayPickerProps = {
    className: cn(calendarVariants(), className),
    classNames: mergedClassNames,
    components: { ...defaultComponents, ...userComponents },
    "data-slot": "calendar",
    formatters: {
      formatMonthDropdown: (date: Date) =>
        date.toLocaleString("default", { month: "short" }),
    } as DayPickerProps["formatters"],
    mode,
    showOutsideDays,
    ...props,
  };

  return <DayPicker {...(dayPickerProps as DayPickerProps)} />;
}

/** `"HH:mm"` for the wall time of `date`, read in `timeZone` when given. */
function timeOf(date: Date, timeZone?: string): string {
  const zoned = timeZone ? new TZDate(date, timeZone) : date;
  return `${String(zoned.getHours()).padStart(2, "0")}:${String(zoned.getMinutes()).padStart(2, "0")}`;
}

/** `day` at the wall time `time` (`"HH:mm"`, seconds 0), as a plain `Date`. */
function withTime(day: Date, time: string, timeZone?: string): Date {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  if (!timeZone) {
    return new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hours,
      minutes,
      0,
      0,
    );
  }
  const zonedDay = new TZDate(day, timeZone);
  const zoned = new TZDate(
    zonedDay.getFullYear(),
    zonedDay.getMonth(),
    zonedDay.getDate(),
    hours,
    minutes,
    0,
    0,
    timeZone,
  );
  return new Date(zoned.getTime());
}

export interface CalendarTimePrimitiveProps
  extends Omit<FieldPrimitiveProps, "children" | "defaultValue" | "onChange"> {
  /** The time on a 24-hour clock, `"HH:mm"`, or `""` for none. Controlled when set. */
  value?: string;
  /** The initial time when uncontrolled. Default `""`. */
  defaultValue?: string;
  /** Called with each committed time, always a complete and valid `"HH:mm"`. */
  onValueChange?: (value: string) => void;
  /** The visible label, which is also the input's accessible name. Default `"Time"`. */
  label?: React.ReactNode;
}

function CalendarTimePrimitive({
  defaultValue = "",
  disabled,
  label = "Time",
  onValueChange,
  value,
  ...props
}: CalendarTimePrimitiveProps) {
  const [inner, setInner] = useState(defaultValue);
  const committed = value ?? inner;
  const [draft, setDraft] = useState<string | null>(null);
  const emitted = useRef<string | null>(null);
  const shown = draft ?? committed;

  const commit = (time: string) => {
    if (time === committed || time === emitted.current) {
      return;
    }
    emitted.current = time;
    if (value === undefined) {
      setInner(time);
    }
    onValueChange?.(time);
  };

  const handleChange = (raw: string) => {
    const next = formatTimeInput(raw);
    setDraft(next);
    if (parseTime(next) === next) {
      commit(next);
    }
  };

  const hidden = times.filter((t) => filterTime(t, draft ?? "")).length === 0;

  return (
    <FieldPrimitive data-slot="calendar-time" {...props} disabled={disabled}>
      <FieldLabel>{label}</FieldLabel>
      <Autocomplete
        autoHighlight={true}
        disabled={disabled}
        filter={(item, query) => filterTime(item, draft === null ? "" : query)}
        items={times}
        onValueChange={handleChange}
        openOnInputClick={true}
        value={shown}
      >
        <AutocompleteInput
          inputMode="numeric"
          maxLength={5}
          onBlur={() => {
            if (draft !== null) {
              const time = parseTime(draft);
              if (time !== null) {
                commit(time);
              }
              setDraft(null);
            }
          }}
          onFocus={(event) => {
            setDraft(null);
            emitted.current = null;
            event.currentTarget.select();
          }}
          placeholder="HH:mm"
          startAddon={<ClockIcon aria-hidden="true" />}
          type="text"
        />
        <AutocompletePopup className={hidden ? "hidden" : undefined}>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </FieldPrimitive>
  );
}

export type CalendarTimeProps = CalendarTimePrimitiveProps;

function CalendarTime({ className, ...props }: CalendarTimeProps) {
  return (
    <CalendarTimePrimitive
      className={cn(calendarTimeVariants(), className)}
      {...props}
    />
  );
}

interface CalendarWithTimeProps extends Omit<PropsBase, "mode" | "required"> {
  mode?: "single";
  required?: boolean;
  selected?: Date | undefined;
  /** Called with the date and time on a day pick and on each completed time. Seconds are 0. */
  onSelect?: (value: Date | undefined) => void;
  /** Adds a 24-hour time field below the day grid. Single-date selection only. */
  showTime: boolean;
  /** Props for the time field, such as its `label`. */
  timeProps?: Omit<
    CalendarTimeProps,
    "value" | "defaultValue" | "onValueChange"
  >;
}

export type CalendarProps =
  | (DayPickerProps & { showTime?: false; timeProps?: undefined })
  | CalendarWithTimeProps;

function CalendarWithTime({
  className,
  disabled,
  onSelect,
  required,
  selected,
  showTime: _showTime,
  timeProps,
  timeZone,
  ...dayPickerProps
}: CalendarWithTimeProps) {
  const controlled = onSelect !== undefined;
  const [inner, setInner] = useState(selected);
  const value = controlled ? selected : inner;
  const [pendingTime, setPendingTime] = useState(
    selected ? timeOf(selected, timeZone) : "",
  );
  const time = value ? timeOf(value, timeZone) : pendingTime;

  const emit = (next: Date | undefined) => {
    if (!controlled) {
      setInner(next);
    }
    onSelect?.(next);
  };

  const onDay = (day: Date | undefined) => {
    if (day === undefined) {
      setPendingTime(time);
      emit(undefined);
      return;
    }
    emit(withTime(day, time || "00:00", timeZone));
  };

  const onTime = (next: string) => {
    if (value) {
      emit(withTime(value, next, timeZone));
    } else {
      setPendingTime(next);
    }
  };

  return (
    <div
      className={cn("flex w-fit flex-col gap-2", className)}
      data-slot="calendar-with-time"
    >
      <CalendarDayPicker
        {...({
          ...dayPickerProps,
          disabled,
          mode: "single",
          onSelect: onDay,
          required,
          selected: value,
          timeZone,
        } as DayPickerProps)}
      />
      <CalendarTime
        {...timeProps}
        disabled={disabled === true || timeProps?.disabled === true}
        onValueChange={onTime}
        value={time}
      />
    </div>
  );
}

/** A month grid for picking a day, several days or a range (`mode`). With `showTime`, a 24-hour time field sits below the grid and the selected `Date` carries the time. */
function Calendar(props: CalendarProps) {
  if (props.showTime === true) {
    return <CalendarWithTime {...props} />;
  }
  const {
    showTime: _showTime,
    timeProps: _timeProps,
    ...dayPickerProps
  } = props;
  return <CalendarDayPicker {...(dayPickerProps as DayPickerProps)} />;
}

export {
  Calendar,
  CalendarTime,
  CalendarTimePrimitive,
  calendarButtonVariants,
  calendarTimeVariants,
  calendarVariants,
};
