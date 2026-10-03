import { describe, expect, it } from "vitest";
import {
  auditUseClient,
  needsClientDirective,
  runtimeImports,
} from "../scripts/use-client-audit.js";

describe("use-client rule (RSC-first)", () => {
  it("requires the directive for hook calls (incl. useRender), browser globals, inline handlers and contexts", () => {
    expect(needsClientDirective("const x = useState(0);")).toBe(true);
    expect(needsClientDirective("return useRender({ render, props });")).toBe(
      true,
    );
    expect(needsClientDirective("const w = window.innerWidth;")).toBe(true);
    expect(
      needsClientDirective("<button onClick={() => setOpen(true)} />"),
    ).toBe(true);
    expect(needsClientDirective("const Ctx = React.createContext(null);")).toBe(
      true,
    );
  });
  it("does not require it for plain wrappers that only forward props (base-ui parts carry their own directive)", () => {
    expect(
      needsClientDirective(
        'function X(props) { return <BaseUIDialog.Trigger data-slot="x" {...props} />; }',
      ),
    ).toBe(false);
    expect(needsClientDirective("<Comp onClick={props.onClick} />")).toBe(
      false,
    );
    expect(needsClientDirective("// window is mentioned in a comment")).toBe(
      false,
    );
  });
  it("requires the directive for imports of client-only modules that ship none", () => {
    // `calendar`, `resizable` and `spinning-text` are hook-free wrappers whose
    // dependency is client-only and directive-less; without this rule they are
    // classified `server` and hard-error on import from an RSC.
    expect(
      needsClientDirective('import { DayPicker } from "@daypicker/react";'),
    ).toBe(true);
    expect(
      needsClientDirective(
        'import * as ResizablePrimitive from "react-resizable-panels";',
      ),
    ).toBe(true);
    expect(needsClientDirective('import { motion } from "motion/react";')).toBe(
      true,
    );
    // @base-ui/react ships its own directive, so it says nothing either way.
    expect(
      needsClientDirective(
        'import { Dialog } from "@base-ui/react/dialog";\nexport const X = 1;',
      ),
    ).toBe(false);
    // A type-only import is erased and never reaches the runtime graph.
    expect(
      needsClientDirective(
        'import type { PanelProps } from "react-resizable-panels";',
      ),
    ).toBe(false);
    // A commented-out import does not count.
    expect(
      needsClientDirective('// import { motion } from "motion/react";'),
    ).toBe(false);
  });
  it("collects only runtime import specifiers", () => {
    expect(
      runtimeImports(
        [
          'import type * as React from "react";',
          'import { motion } from "motion/react";',
          'import "./styles.css";',
          'const m = await import("./late.js");',
        ].join("\n"),
      ),
    ).toEqual(["motion/react", "./styles.css"]);
  });
  it("audits files against their first-line directive", () => {
    const r = auditUseClient([
      { path: "a.tsx", text: '"use client";\nconst [s] = useState();' },
      { path: "b.tsx", text: "const [s] = useState();" },
      { path: "c.tsx", text: '"use client";\nexport const X = 1;' },
    ]);
    expect(r).toEqual([
      { path: "a.tsx", needsClient: true, hasDirective: true },
      { path: "b.tsx", needsClient: true, hasDirective: false },
      { path: "c.tsx", needsClient: false, hasDirective: true },
    ]);
  });
});
