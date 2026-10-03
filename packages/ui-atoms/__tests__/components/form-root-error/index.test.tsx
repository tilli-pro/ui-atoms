import { describe, expect, it } from "vitest";
import {
  FormRootError,
  FormRootErrorPrimitive,
  formRootErrorCardHeaderVariants,
  formRootErrorVariants,
} from "../../../src/components/form-root-error/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

const WHITESPACE = /\s+/;

/** The header element of the most recently rendered card variant. */
function cardHeader(): HTMLElement {
  const header = document.querySelector<HTMLElement>(
    '[data-slot="card-header"]',
  );
  expect(header).not.toBeNull();
  return header as HTMLElement;
}

describe("FormRootError (i18n-free)", () => {
  it("renders nothing for an absent or blank message", () => {
    const { container } = render(
      <>
        <FormRootError />
        <FormRootError message="   " />
      </>,
    );
    expect(container.innerHTML).toBe("");
  });
  it("default variant renders the message in a <p> (or `as`) with the v2 classes", () => {
    render(<FormRootError message="Something failed" size="lg" />);
    const p = screen.getByText("Something failed");
    expect(p.tagName).toBe("P");
    expectSlot(p, "form-root-error");
    expect(p.className).toContain("text-destructive text-center");
    expect(p.className).toContain("text-lg");
    render(<FormRootError as="div" message="As div" />);
    expect(screen.getByText("As div").tagName).toBe("DIV");
  });
  it("card variant composes Card parts with icon, title and message", () => {
    render(
      <FormRootError
        cardHeaderClassName="extra"
        message="Try again later"
        size="lg"
        title="Let's try again"
        variant="card"
      />,
    );
    const title = screen.getByText("Let's try again");
    expectSlot(title, "card-title");
    const header = title.closest('[data-slot="card-header"]') as HTMLElement;
    expect(header.className).toContain("extra");
    expect(header.querySelector("svg")).not.toBeNull();
    expectSlot(screen.getByText("Try again later"), "card-description");
    const card = header.parentElement as HTMLElement;
    expectSlot(card, "form-root-error");
    expect(card.className).toContain("text-primary");
    expect(card.className).toContain("text-lg");
    // Structure: the icon and the title/description block are the header's two
    // direct children, icon first.
    const children = [...header.children];
    expect(children).toHaveLength(2);
    expect(children[0]?.tagName.toLowerCase()).toBe("svg");
    expect(children[1]?.textContent).toContain("Let's try again");
    expect(children[1]?.textContent).toContain("Try again later");
  });
  it("card header layout: the merge with CardHeader's base leaves `grid` in force", () => {
    // Characterisation, not an endorsement. `cn()` merges this component's
    // verbatim header string onto CardHeader's own base, and `grid` (display)
    // and `flex-row` (flex-direction) are different tailwind-merge groups, so
    // both survive: the header lays out as a two-row grid and `flex-row` /
    // `space-x-*` are inert. That is exactly what the source component did
    // (its card header base was the same grid), so this is faithful, not a
    // regression — but it is the layout a baseline review has to sign off on,
    // and this test turns red the moment that answer changes the output.
    render(<FormRootError message="m" title="t" variant="card" />);
    const classes = cardHeader().className.split(WHITESPACE);
    expect(classes).toContain("grid"); // from CardHeader's base: wins `display`
    expect(classes).toContain("grid-rows-[auto_auto]");
    expect(classes).toContain("flex-row"); // present, inert while `grid` stands
    expect(classes).not.toContain("flex");
    // What the header string does win: cross-axis alignment and the padding.
    expect(classes).toContain("items-center");
    expect(classes).not.toContain("items-start");
    expect(classes).toEqual(
      expect.arrayContaining(["space-x-2", "px-2", "py-1.5"]),
    );
    // The header string itself is the verbatim source string, unchanged.
    expect(formRootErrorCardHeaderVariants()).toBe(
      "flex-row items-center space-x-2 px-2 py-1.5 sm:space-x-4 sm:px-3 sm:py-2",
    );
  });
  it("withIcon=false omits the icon; primitive carries no classes; ref is a plain prop", () => {
    render(
      <FormRootError message="m" title="t" variant="card" withIcon={false} />,
    );
    expect(document.querySelector('[data-slot="card-header"] svg')).toBeNull();
    let node: HTMLElement | null = null;
    render(
      <FormRootErrorPrimitive
        message="prim"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).not.toBeNull();
    expect(screen.getByText("prim").className).toBe("");
    expect(formRootErrorVariants({ variant: "card" })).toContain(
      "text-primary",
    );
  });
});
