import { describe, expect, it } from "vitest";
import { ScrollArea } from "../../../src/components/scroll-area/index.js";
import { render, screen } from "../../helpers/render.js";

describe("ScrollArea (coss base — SCR-1..SCR-4)", () => {
  it("SCR-1: the caller className lands on the Root, not the Viewport", () => {
    render(
      <ScrollArea className="flex-1" data-testid="sa">
        body
      </ScrollArea>,
    );
    const root = screen.getByTestId("sa");
    // The base puts no data-slot on the Root; it is addressed by the caller's own props.
    expect(root.className).toContain("min-h-0");
    expect(root.className).toContain("flex-1");
    const viewport = root.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    expect(viewport.className).not.toContain("flex-1");
  });
  it("SCR-4: a Content wrapper carries its own slot", () => {
    render(<ScrollArea data-testid="sa">body</ScrollArea>);
    expect(
      screen
        .getByTestId("sa")
        .querySelector('[data-slot="scroll-area-content"]'),
    ).not.toBeNull();
  });
  it("SCR-3: overscrollContain is opt-in, not unconditional", () => {
    const { rerender } = render(<ScrollArea data-testid="sa">b</ScrollArea>);
    const off = (
      screen
        .getByTestId("sa")
        .querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
    ).className;
    expect(off).not.toContain("overscroll-y-contain");
    rerender(
      <ScrollArea data-testid="sa" overscrollContain={true}>
        b
      </ScrollArea>,
    );
    expect(
      (
        screen
          .getByTestId("sa")
          .querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
      ).className,
    ).toContain("data-has-overflow-y:overscroll-y-contain");
  });
  it("SCR-3/SCR-4: clampContentMinWidth defaults to true, so Content carries minWidth: 0", () => {
    const { rerender } = render(<ScrollArea data-testid="sa">b</ScrollArea>);
    const content = () =>
      screen
        .getByTestId("sa")
        .querySelector('[data-slot="scroll-area-content"]') as HTMLElement;
    expect(content().style.minWidth).toBe("0px");
    rerender(
      <ScrollArea clampContentMinWidth={false} data-testid="sa">
        b
      </ScrollArea>,
    );
    // Opting out drops *our* clamp and falls back to Base UI's own Content
    // default (`min-width: fit-content`, ScrollAreaContent.mjs) — the clamp is
    // an override of that default, never the only source of a min-width.
    expect(content().style.minWidth).toBe("fit-content");
  });
  it("SCR-2: there is no orientation prop left to mis-specify", () => {
    // Typecheck-only guard: vitest does not typecheck, so this line is inert under
    // `test`. It bites at `pnpm --filter @tilli.dev/ui-atoms typecheck`, which gates every
    // commit.
    // @ts-expect-error orientation was dropped with SCR-2; base-ui hides the unused bar itself.
    render(<ScrollArea orientation="vertical">b</ScrollArea>);
  });
});
