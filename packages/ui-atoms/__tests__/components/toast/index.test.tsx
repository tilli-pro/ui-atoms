import { act } from "react";
import { describe, expect, it } from "vitest";
import {
  ToastProvider,
  toastManager,
} from "../../../src/components/toast/index.js";
import { render, screen } from "../../helpers/render.js";

// TST-3: per-toast rootProps is how the root is reachable — there is no data-slot on Toast.Root.
const rootProps = { "data-testid": "toast-root" } as const;

describe("Toast (coss base — TST-3, TST-4)", () => {
  it("TST-4: updateKey alternates the replay class on every update", async () => {
    render(<ToastProvider />);
    let id = "";
    act(() => {
      id = toastManager.add({
        title: "Saved",
        type: "success",
        data: { rootProps },
      });
    });
    const root = await screen.findByTestId("toast-root");
    expect(root.className).not.toMatch(/animate-toast-/); // updateKey 0 -> no replay
    act(() => {
      toastManager.update(id, { title: "Saved again" });
    });
    expect(root.className).toContain("animate-toast-success-odd"); // updateKey 1
    act(() => {
      toastManager.update(id, { title: "Saved once more" });
    });
    expect(root.className).toContain("animate-toast-success-even"); // updateKey 2
  });
  it("TST-4: the error type gets its own keyframe pair", async () => {
    render(<ToastProvider />);
    let id = "";
    act(() => {
      id = toastManager.add({
        title: "Nope",
        type: "error",
        data: { rootProps },
      });
    });
    const root = await screen.findByTestId("toast-root");
    act(() => {
      toastManager.update(id, { title: "Still nope" });
    });
    expect(root.className).toContain("animate-toast-error-odd");
  });
});
