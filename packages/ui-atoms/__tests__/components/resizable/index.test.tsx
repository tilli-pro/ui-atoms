import { beforeAll, describe, expect, it } from "vitest";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  resizableHandleVariants,
} from "../../../src/components/resizable/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

// jsdom has no ResizeObserver, which the library constructs on mount to measure its group.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {
      // nothing to measure in jsdom
    }
    unobserve() {
      // nothing to measure in jsdom
    }
    disconnect() {
      // nothing to measure in jsdom
    }
  } as unknown as typeof ResizeObserver;
});

describe("Resizable (shadcn resizable on react-resizable-panels 4.x)", () => {
  it("renders group, panels and a separator with the data-slots and a grip", () => {
    render(
      <ResizablePanelGroup data-testid="group" orientation="horizontal">
        <ResizablePanel defaultSize="50%">One</ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize="50%">Two</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expectSlot(screen.getByTestId("group"), "resizable-panel-group");
    expect(
      document.querySelectorAll('[data-slot="resizable-panel"]'),
    ).toHaveLength(2);
    const handle = screen.getByRole("separator");
    expectSlot(handle, "resizable-handle");
    // RSZ-1: the grip is ours, and is a direct child so the rotate selector reaches it.
    expectSlot(handle.firstElementChild, "resizable-handle-grip");
  });

  it("omits the grip by default and focuses with the coss field halo", () => {
    render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel>One</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Two</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByRole("separator").childElementCount).toBe(0);
    const classes = resizableHandleVariants();
    expect(classes).toContain("focus-visible:ring-[3px]");
    expect(classes).toContain("focus-visible:ring-ring/24");
    expect(classes).not.toContain("focus-visible:ring-1");
  });
});
