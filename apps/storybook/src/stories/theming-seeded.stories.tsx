import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import { Input } from "@tilli.dev/ui-atoms/input";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@tilli.dev/ui-atoms/tabs";

const meta = {
  title: "Components/SeededTheme",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "`theme-seeded` derives every colour token from two seeds, `--seed-primary` and `--seed-background`. Apply it together with `theme-mode-light` or `theme-mode-dark` on the element that sets the seeds. Nothing here uses the default theme's greys.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const seeds = (primary: string, background: string) =>
  ({
    "--seed-primary": primary,
    "--seed-background": background,
  }) as CSSProperties;

function Sample({ label }: { label: string }) {
  return (
    <div className="flex w-80 flex-col gap-4 bg-background p-6 text-foreground">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTab value="account">Account</TabsTab>
          <TabsTab value="billing">Billing</TabsTab>
        </TabsList>
        <TabsPanel value="account">
          <Card>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>
                Every colour here comes from two seeds.
              </CardDescription>
            </CardHeader>
            <CardPanel>
              <Input aria-label={`${label} email`} placeholder="Email" />
            </CardPanel>
            <CardFooter className="gap-2">
              <Button>Save</Button>
              <Button variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </TabsPanel>
        <TabsPanel value="billing">No invoices yet.</TabsPanel>
      </Tabs>
    </div>
  );
}

export const LightAndDark: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <div
        className="theme-mode-light theme-seeded"
        style={seeds("oklch(28% 0.06 315)", "oklch(98% 0.01 90)")}
      >
        <Sample label="Seeded light" />
      </div>
      <div
        className="theme-mode-dark theme-seeded"
        style={seeds("oklch(94% 0.03 90)", "oklch(22% 0.04 300)")}
      >
        <Sample label="Seeded dark" />
      </div>
    </div>
  ),
};
