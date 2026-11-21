import { describe, expect, it } from "vitest";
import { renderRecipeModule } from "../../src/cli/template.js";

describe("renderRecipeModule", () => {
  it("writes one empty named import per component, sorted, and a default export", () => {
    expect(
      renderRecipeModule("settings-dialog", ["dialog", "button"]),
    ).toBe(`import {} from "@tilli.dev/ui-atoms/button";
import {} from "@tilli.dev/ui-atoms/dialog";

export default function SettingsDialog() {
  return (
    <main className="flex flex-col gap-4 p-8">
      {/* TODO: compose this recipe from the imported ui-atoms components. */}
    </main>
  );
}
`);
  });

  it("omits the import block when no component was picked", () => {
    const source = renderRecipeModule("blank", []);
    expect(source.startsWith("export default function Blank() {")).toBe(true);
    expect(source).not.toContain("import {");
  });
});
