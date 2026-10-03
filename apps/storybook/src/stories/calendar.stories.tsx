import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "@tilli.dev/ui-atoms/calendar";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// A fixed past month and value, so the frame never depends on today's date.
const JANUARY = new Date(2026, 0, 15);
const NINE_THIRTY = new Date(2026, 0, 15, 9, 30);
const QUARTER_HOUR = /^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/;

function dayButton(canvas: HTMLElement, iso: string): HTMLButtonElement {
  const button = canvas.querySelector<HTMLButtonElement>(
    `[data-day="${iso}"] button`,
  );
  if (!button) throw new Error(`no day button for ${iso}`);
  return button;
}

export const WithTime: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`showTime` adds a 24-hour time field below the day grid, and the selected `Date` carries the time: picking a day keeps the time, and entering a time keeps the day. Type `930`, `9:30` or `0930`, or pick from the quarter-hour list; seconds are always zero. With `timeZone`, the day and the time are read and written in that zone. `timeProps` passes props such as `label` to the time field.",
      },
    },
  },
  render: () => (
    <Calendar
      defaultMonth={JANUARY}
      mode="single"
      selected={NINE_THIRTY}
      showTime={true}
    />
  ),
};

export const WithTimeKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Keyboard only: Tab moves from the day grid to the time field. Type a time, or press the arrow keys and Enter to pick one from the list.",
      },
    },
  },
  render: () => (
    <Calendar
      defaultMonth={JANUARY}
      mode="single"
      selected={NINE_THIRTY}
      showTime={true}
    />
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", {
      name: "Time",
    });
    await expect(input).toHaveValue("09:30");
    // The time field is the next tab stop after the day grid.
    dayButton(canvasElement, "2026-01-15").focus();
    await userEvent.tab();
    await expect(input).toHaveFocus();
    // Typed digits become HH:mm, and leaving the field keeps the time.
    await userEvent.clear(input);
    await userEvent.keyboard("1745");
    await expect(input).toHaveValue("17:45");
    await userEvent.tab();
    await expect(input).toHaveValue("17:45");
    // The list offers 24-hour quarter hours; the arrow keys and Enter pick one.
    await userEvent.clear(input);
    await userEvent.keyboard("2");
    const options = await screen.findAllByRole("option");
    const labels = options.map((option) => option.textContent ?? "");
    await expect(labels.length).toBeGreaterThan(0);
    await expect(labels.every((label) => QUARTER_HOUR.test(label))).toBe(true);
    await userEvent.keyboard("{ArrowDown}");
    const highlighted = await waitFor(() => {
      const option = document.querySelector<HTMLElement>(
        "[data-slot=autocomplete-item][data-highlighted]",
      );
      if (!option) throw new Error("no highlighted option");
      return option;
    });
    const picked = highlighted.textContent ?? "";
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue(picked);
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    // A day picked from the keyboard keeps that time.
    dayButton(canvasElement, "2026-01-15").focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-day="2026-01-16"]'),
      ).toHaveAttribute("data-selected"),
    );
    await expect(input).toHaveValue(picked);
  },
};
