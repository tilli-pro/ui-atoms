---
"@tilli.dev/ui-atoms": patch
---

`menu`, `context-menu`, `select`, `autocomplete` and `combobox` popups animate open and closed
again. Base UI sets `data-starting-style` / `data-ending-style` on the Popup element; coss's older
shape reacted to them from a wrapper `<span>` with `has-data-starting-style:` rules, and when the
base moved the classes onto the Popup (MNU-2) it dropped the transition instead of rewriting it,
while its popover kept one. Autocomplete and combobox still have the frame `<span>`, but the base
kept only `transition-[scale,opacity]` on it with no starting or ending rules.

Menu, context-menu and select now carry `transition-[scale,opacity]` with `data-starting-style:`
and `data-ending-style:` scale/opacity rules on the element Base UI marks (MNU-7, CTX-2, SEL-3);
autocomplete and combobox carry the same as `has-data-starting-style:` / `has-data-ending-style:`
rules on their frame span (ACP-2, CBX-8). All five fade and scale in, and stay mounted through the
exit transition instead of unmounting at once.
