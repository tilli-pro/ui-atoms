import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@tilli.dev/ui-atoms/combobox";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

const COUNTRIES = {
  "North America": ["Canada", "Mexico", "United States"],
  Europe: ["France", "Germany", "Italy", "Spain", "United Kingdom"],
  Asia: ["China", "India", "Japan", "South Korea"],
};

export const Default: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Combobox>
        <ComboboxInput placeholder="Search fruits..." />
        <ComboboxPopup>
          <ComboboxList>
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Combobox>
        <ComboboxInput placeholder="Search countries..." />
        <ComboboxPopup>
          <ComboboxList>
            {Object.entries(COUNTRIES).map(([region, countries]) => (
              <ComboboxGroup key={region}>
                <ComboboxGroupLabel>{region}</ComboboxGroupLabel>
                {countries.map((country) => (
                  <ComboboxItem key={country} value={country}>
                    {country}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ))}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Combobox multiple={true}>
        <ComboboxChips>
          <ComboboxChip>Apple</ComboboxChip>
          <ComboboxInput placeholder="Add more fruits..." />
        </ComboboxChips>
        <ComboboxPopup>
          <ComboboxList>
            {FRUITS.map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Combobox>
        <ComboboxInput placeholder="Search for something..." />
        <ComboboxPopup>
          <ComboboxList>
            <ComboboxEmpty>No results found.</ComboboxEmpty>
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      {/* The static-children form (as `Default` uses, with no `items` prop)
          never narrows the rendered set — Base UI's `AriaCombobox` returns
          an empty `filteredItems` array whenever `items` is undefined, so
          typing does not remove non-matching children. Type-to-filter needs
          the `items`-driven form (same reasoning as `command.stories.tsx`'s
          `Interactive`). */}
      <Combobox items={FRUITS}>
        <ComboboxInput placeholder="Search fruits..." />
        <ComboboxPopup>
          <ComboboxList>
            {(fruit: string) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input =
      within(canvasElement).getByPlaceholderText("Search fruits...");
    await userEvent.type(input, "Che");
    await waitFor(async () =>
      expect(
        await screen.findByRole("option", { name: "Cherry" }),
      ).toBeVisible(),
    );
    await expect(
      screen.queryByRole("option", { name: "Apple" }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("option", { name: "Cherry" }),
      ).not.toBeInTheDocument(),
    );
  },
};
