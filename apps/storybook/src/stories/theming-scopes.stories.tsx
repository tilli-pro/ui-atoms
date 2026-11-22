import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "@tilli.dev/ui-atoms/card";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/ThemeScopes",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "`data-theme` and `data-contrast` scope to the element that carries them. These cases nest the two in every order; each box shows the tokens its own scope resolves to.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

type Scope = { theme?: "light" | "dark"; contrast?: "high" };

const LIGHT_HIGH = "oklch(0.145 0 0)";
const DARK_HIGH = "oklch(0.985 0 0)";
const LIGHT_BACKGROUND = "oklch(1 0 0)";
const DARK_BACKGROUND = "oklch(0.145 0 0)";

/** Outermost scope first; the innermost one is the box that is measured. */
const CASES: {
  id: string;
  scopes: Scope[];
  background: string;
  muted: string;
}[] = [
  {
    id: "light-high-in-dark",
    scopes: [{ theme: "dark" }, { theme: "light", contrast: "high" }],
    background: LIGHT_BACKGROUND,
    muted: LIGHT_HIGH,
  },
  {
    id: "dark-high",
    scopes: [{ theme: "dark", contrast: "high" }],
    background: DARK_BACKGROUND,
    muted: DARK_HIGH,
  },
  {
    id: "dark-in-high",
    scopes: [{ contrast: "high" }, { theme: "dark" }],
    background: DARK_BACKGROUND,
    muted: DARK_HIGH,
  },
  {
    id: "high-in-dark",
    scopes: [{ theme: "dark" }, { contrast: "high" }],
    background: DARK_BACKGROUND,
    muted: DARK_HIGH,
  },
  {
    id: "high-in-light-in-dark",
    scopes: [{ theme: "dark" }, { theme: "light" }, { contrast: "high" }],
    background: LIGHT_BACKGROUND,
    muted: LIGHT_HIGH,
  },
  {
    id: "light-high",
    scopes: [{ theme: "light", contrast: "high" }],
    background: LIGHT_BACKGROUND,
    muted: LIGHT_HIGH,
  },
  {
    id: "light-in-high",
    scopes: [{ contrast: "high" }, { theme: "light" }],
    background: LIGHT_BACKGROUND,
    muted: LIGHT_HIGH,
  },
  {
    id: "dark-high-in-light-in-dark",
    scopes: [
      { theme: "dark" },
      { theme: "light" },
      { theme: "dark", contrast: "high" },
    ],
    background: DARK_BACKGROUND,
    muted: DARK_HIGH,
  },
];

function Nested({ scopes, id }: { scopes: Scope[]; id: string }) {
  const [scope, ...rest] = scopes;
  if (!scope) return null;
  const innermost = rest.length === 0;
  const children: ReactNode = innermost ? (
    <>
      <span className="font-medium">{id}</span>
      <span className="text-muted-foreground">muted text</span>
    </>
  ) : (
    <Nested id={id} scopes={rest} />
  );
  return (
    <div
      className={
        innermost
          ? "flex flex-col gap-1 rounded-md border bg-background p-3 text-foreground text-sm"
          : "contents"
      }
      data-contrast={scope.contrast}
      data-testid={innermost ? id : undefined}
      data-theme={scope.theme}
    >
      {children}
    </div>
  );
}

export const NestedScopes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      {CASES.map(({ id, scopes }) => (
        <Nested id={id} key={id} scopes={scopes} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const { id, background, muted } of CASES) {
      const style = getComputedStyle(canvas.getByTestId(id));
      await expect(
        [
          id,
          style.getPropertyValue("--background").trim(),
          style.getPropertyValue("--muted-foreground").trim(),
        ].join(" | "),
      ).toBe([id, background, muted].join(" | "));
    }
  },
};
