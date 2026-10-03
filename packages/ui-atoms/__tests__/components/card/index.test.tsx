import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardFrame,
  CardHeader,
  CardPanel,
  CardPrimitive,
  CardTitle,
  cardPanelVariants,
  cardVariants,
} from "../../../src/components/card/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Card family (coss base — CRD-1, CRD-2, CRD-3)", () => {
  it("CRD-2: every part carries the coss data-slot, and the panel is card-panel", () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">T</CardTitle>
          <CardDescription data-testid="desc">D</CardDescription>
          <CardAction data-testid="action">A</CardAction>
        </CardHeader>
        <CardPanel data-testid="panel">P</CardPanel>
        <CardFooter data-testid="footer">F</CardFooter>
      </Card>,
    );
    expectSlot(screen.getByTestId("card"), "card");
    expectSlot(screen.getByTestId("header"), "card-header");
    expectSlot(screen.getByTestId("title"), "card-title");
    expectSlot(screen.getByTestId("desc"), "card-description");
    expectSlot(screen.getByTestId("action"), "card-action");
    expectSlot(screen.getByTestId("panel"), "card-panel");
    expectSlot(screen.getByTestId("footer"), "card-footer");
    expect(screen.getByTestId("panel").className).toContain("p-6");
  });
  it("CRD-3: CardContent is the same component under its coss alias, so 103 call sites need no edit", () => {
    expect(CardContent).toBe(CardPanel);
    render(<CardContent data-testid="c">x</CardContent>);
    expectSlot(screen.getByTestId("c"), "card-panel");
  });
  it("CRD-1: the CardFrame family exists and is separate from Card", () => {
    render(<CardFrame data-testid="f">x</CardFrame>);
    expectSlot(screen.getByTestId("f"), "card-frame");
  });
  it("primitives carry the slot but no classes; variants are exported", () => {
    render(<CardPrimitive data-testid="p" />);
    expect(screen.getByTestId("p").className).toBe("");
    expect(cardVariants()).toContain("bg-card");
    expect(cardPanelVariants()).toContain("p-6");
  });
  it("className merges last-wins", () => {
    render(<CardPanel className="p-2" data-testid="panel" />);
    expect(screen.getByTestId("panel").className).toContain("p-2");
    expect(screen.getByTestId("panel").className).not.toMatch(/\bp-6\b/);
  });
});
