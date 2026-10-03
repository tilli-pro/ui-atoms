import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App.js";

describe("playground consumes @tilli.dev/ui-atoms through its exports map (dist)", () => {
  it("renders parts from five subpaths", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Primary" })).toHaveAttribute(
      "data-slot",
      "button",
    );
    expect(screen.getByText("Card title")).toHaveAttribute(
      "data-slot",
      "card-title",
    );
    expect(screen.getByRole("checkbox", { name: "Agree" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
    expect(screen.getByText("badge")).toHaveAttribute("data-slot", "badge");
  });
  it("resolves the package from dist, not src", async () => {
    const mod = await import("@tilli.dev/ui-atoms/button");
    // dist output is compiled JS: no JSX source markers survive
    expect(typeof mod.Button).toBe("function");
    const resolved = import.meta.resolve("@tilli.dev/ui-atoms/button");
    expect(resolved).toMatch(/\/dist\/components\/button\/index\.js$/);
  });
});
