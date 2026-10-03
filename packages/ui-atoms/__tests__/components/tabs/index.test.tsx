import { describe, expect, it } from "vitest";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "../../../src/components/tabs/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Tabs (coss base, TAB-1/TAB-2/TAB-3)", () => {
  it("renders list/tab/panel with the coss data-slots", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTab value="a">A</TabsTab>
          <TabsTab value="b">B</TabsTab>
        </TabsList>
        <TabsPanel value="a">panel a</TabsPanel>
      </Tabs>,
    );
    expectSlot(screen.getByText("A"), "tabs-tab");
    expect(
      screen.getByText("panel a").closest("[data-slot=tabs-content]"),
    ).not.toBeNull();
  });
  it("a11y: the default variant's inactive-tab text is full strength, not /72 — 2.67:1 against bg-muted failed axe color-contrast", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList variant="default">
          <TabsTab value="a">A</TabsTab>
          <TabsTab value="b">B</TabsTab>
        </TabsList>
      </Tabs>,
    );
    const list = document.querySelector("[data-slot=tabs-list]");
    expect(list?.className).not.toContain("text-muted-foreground/72");
    expect(list?.className).toContain("text-muted-foreground");
  });
});
