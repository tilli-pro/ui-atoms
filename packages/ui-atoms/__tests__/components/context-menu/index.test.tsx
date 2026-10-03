import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from "../../../src/components/context-menu/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("ContextMenu (CTX-1 — provisional subpath)", () => {
  it("CTX-1: right-clicking the trigger opens the popup with the context-menu slots", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>area</ContextMenuTrigger>
        <ContextMenuPopup>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuPopup>
      </ContextMenu>,
    );
    const trigger = screen.getByText("area");
    expectSlot(trigger, "context-menu-trigger");
    fireEvent.contextMenu(trigger);
    const popup = await screen.findByRole("menu");
    expectSlot(popup, "context-menu-popup");
    expectSlot(screen.getByText("Copy"), "context-menu-item");
    expect(
      document.querySelector('[data-slot="context-menu-positioner"]'),
    ).not.toBeNull();
  });
});
