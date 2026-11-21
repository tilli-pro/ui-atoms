import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Composer,
  ComposerActionGroup,
  ComposerActions,
  ComposerInput,
  ComposerItem,
  type ComposerItemValue,
  ComposerList,
  ComposerPopup,
  ComposerSubmit,
  type ComposerTrigger,
  type ComposerValue,
  getComposerText,
} from "@tilli.dev/ui-atoms/composer";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Composer",
  component: Composer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

const triggers: ComposerTrigger[] = [
  {
    character: "@",
    items: [
      { id: "alex", label: "Alex Morgan" },
      { id: "sam", label: "Sam Rivera" },
      { id: "design", label: "Design team" },
    ],
  },
  {
    character: "/",
    items: [
      { id: "summarize", label: "Summarize", type: "action" as const },
      { id: "rewrite", label: "Rewrite", type: "action" as const },
    ],
  },
];

function ComposerDemo({
  layout,
  withSuggestions = false,
}: {
  layout?: "stacked" | "adaptive" | undefined;
  withSuggestions?: boolean;
}) {
  const [value, setValue] = useState<ComposerValue>([]);
  const [notice, setNotice] = useState("");
  return (
    <div className="flex w-96 max-w-full flex-col gap-3">
      <Composer
        {...(layout ? { layout } : {})}
        {...(withSuggestions ? { triggers } : {})}
        onSubmit={(draft) => {
          setNotice(`Sent: ${getComposerText(draft)}`);
          setValue([]);
        }}
        onValueChange={setValue}
        value={value}
      >
        <ComposerInput aria-label="Message" placeholder="Write a message…" />
        {withSuggestions && (
          <ComposerPopup>
            <ComposerList>
              {(item: ComposerItemValue) => (
                <ComposerItem key={item.id} value={item}>
                  <span className="truncate">{item.label}</span>
                </ComposerItem>
              )}
            </ComposerList>
          </ComposerPopup>
        )}
        <ComposerActions>
          <ComposerActionGroup align="end">
            <ComposerSubmit render={<Button size="sm">Send</Button>} />
          </ComposerActionGroup>
        </ComposerActions>
      </Composer>
      <p className="min-h-5 text-muted-foreground text-sm" role="status">
        {notice}
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <ComposerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Message")).toBeInTheDocument();
    // Nothing to send yet: the submit button follows the editor's `canSubmit`.
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
  },
};

export const Adaptive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`layout="adaptive"` keeps the actions beside a short draft and moves them below once the text wraps.',
      },
    },
  },
  render: () => <ComposerDemo layout="adaptive" />,
};

export const WithSuggestions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`triggers` maps a character to a list of items. Type `@` for people and teams or `/` for actions; picking one inserts a token. Pressing the submit button keeps focus in the input, including on iOS Safari.",
      },
    },
  },
  render: () => <ComposerDemo withSuggestions={true} />,
};
