import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "@tilli.dev/ui-atoms/autocomplete";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Autocomplete",
  component: Autocomplete,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Item {
  label: string;
  value: string;
}

const CITIES: Item[] = [
  { label: "Amsterdam", value: "amsterdam" },
  { label: "Berlin", value: "berlin" },
  { label: "Lisbon", value: "lisbon" },
  { label: "Madrid", value: "madrid" },
  { label: "Paris", value: "paris" },
  { label: "Vienna", value: "vienna" },
];

const GROUPED = [
  {
    value: "Europe",
    items: [
      { label: "Berlin", value: "berlin" },
      { label: "Paris", value: "paris" },
    ],
  },
  {
    value: "Americas",
    items: [
      { label: "Lima", value: "lima" },
      { label: "Toronto", value: "toronto" },
    ],
  },
];

function CityList() {
  return (
    <AutocompletePopup>
      <AutocompleteEmpty>No cities found.</AutocompleteEmpty>
      <AutocompleteList>
        {(item: Item) => (
          <AutocompleteItem key={item.value} value={item}>
            {item.label}
          </AutocompleteItem>
        )}
      </AutocompleteList>
    </AutocompletePopup>
  );
}

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Autocomplete items={CITIES}>
        <AutocompleteInput aria-label="City" placeholder="Search cities…" />
        <CityList />
      </Autocomplete>
    </div>
  ),
};

export const WithClearAndTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`showClear` adds a button that empties the input once it has a value; `showTrigger` adds a chevron that opens the list without typing.",
      },
    },
  },
  render: () => (
    <div className="w-64">
      <Autocomplete defaultValue="Lisbon" items={CITIES}>
        <AutocompleteInput
          aria-label="City"
          // The clear button is icon-only and has no name of its own.
          clearProps={{ "aria-label": "Clear" }}
          placeholder="Search cities…"
          showClear={true}
          showTrigger={true}
        />
        <CityList />
      </Autocomplete>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div className="w-64">
      <Autocomplete items={GROUPED}>
        <AutocompleteInput aria-label="City" placeholder="Search cities…" />
        <AutocompletePopup>
          <AutocompleteEmpty>No cities found.</AutocompleteEmpty>
          <AutocompleteList>
            {(group: (typeof GROUPED)[number]) => (
              <AutocompleteGroup items={group.items} key={group.value}>
                <AutocompleteGroupLabel>{group.value}</AutocompleteGroupLabel>
                {group.items.map((item) => (
                  <AutocompleteItem key={item.value} value={item}>
                    {item.label}
                  </AutocompleteItem>
                ))}
              </AutocompleteGroup>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Autocomplete disabled={true} items={CITIES}>
        <AutocompleteInput aria-label="City" placeholder="Search cities…" />
        <CityList />
      </Autocomplete>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="w-64">
      <Autocomplete items={CITIES}>
        <AutocompleteInput aria-label="City" placeholder="Search cities…" />
        <CityList />
      </Autocomplete>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "City" });
    await userEvent.type(input, "ma");
    // The popup mounts mid-transition, so the lookup retries past it.
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Madrid" })).toBeVisible(),
    );
    // Filtering and selection both settle a frame or two after the event, so each
    // assertion retries instead of reading the DOM once.
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Paris" })).toBeNull(),
    );
    await userEvent.click(screen.getByRole("option", { name: "Madrid" }));
    await waitFor(() => expect(input).toHaveValue("Madrid"));
    // Selecting closes the popup, which stays mounted for its exit transition. For those
    // few frames the listbox is no longer tied to the input (its aria-controls is gone), so
    // an accessibility check that lands there reports a nameless listbox. Wait it out, or
    // the story fails at random.
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};
