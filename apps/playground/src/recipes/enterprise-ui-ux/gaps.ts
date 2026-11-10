/**
 * Registry of ui-atoms gaps surfaced by the enterprise mocks. Each entry names a concept the
 * mocks need but ui-atoms cannot express simply, and how the mock renders the shortfall.
 */
export type GapId =
  | "charts"
  | "map"
  | "softphone"
  | "flow-builder"
  | "rich-text"
  | "drag-calendar"
  | "kanban"
  | "data-grid"
  | "filter-builder"
  | "file-import"
  | "merge-review"
  | "nested-rows"
  | "nonlinear-stepper"
  | "time-inputs"
  | "pdf-preview"
  | "code-block";

export type GapEntry = {
  concept: string;
  reason: string;
  rendering: "approximation" | "placeholder" | "badge" | "listed";
};

export const gaps: Record<GapId, GapEntry> = {
  charts: {
    concept:
      "Trend / area / bar charts (MRR sparkline, aging, revenue and payments by month, hourly call volume, pipeline by stage, social analytics, campaign performance)",
    reason: "no chart part",
    rendering: "approximation",
  },
  map: {
    concept: "Outage / disaster map with markers and boundaries",
    reason: "no map part",
    rendering: "placeholder",
  },
  softphone: {
    concept: "Amazon Connect CCP dock, dialpad, call controls",
    reason: "third-party iframe, no dialpad part",
    rendering: "placeholder",
  },
  "flow-builder": {
    concept: "Workflow builder canvas; IVR flow editor",
    reason: "node/edge canvas with drag and drop",
    rendering: "badge",
  },
  "rich-text": {
    concept:
      "Email / MJML editor, HTML preview, template editors per channel, call script editor",
    reason: "WYSIWYG and sandboxed HTML",
    rendering: "badge",
  },
  "drag-calendar": {
    concept:
      "Social content calendar; staff resource calendar; reschedule slot picker",
    reason: "the calendar part is a date picker",
    rendering: "approximation",
  },
  kanban: {
    concept: "Deals pipeline board",
    reason: "no board part",
    rendering: "approximation",
  },
  "data-grid": {
    concept:
      "Select-all across pages, sticky bulk bar, column chooser, per-currency footer totals, virtualization at 5M rows",
    reason:
      "the table part has no selection, column visibility or virtualization",
    rendering: "approximation",
  },
  "filter-builder": {
    concept:
      "Progressive filter panel (operator + value, between, tri-state, custom fields), applied-filter chips, query syntax in search (`balance > 500`)",
    reason: "composite builder, not one part",
    rendering: "approximation",
  },
  "file-import": {
    concept:
      "CSV import wizard with column mapping; bill PDF drop zone; audience CSV feed; ticket attachments",
    reason: "no file drop zone or mapper grid",
    rendering: "badge",
  },
  "merge-review": {
    concept: "Duplicate merge: pick survivor, field-by-field compare",
    reason: "bespoke diff view",
    rendering: "listed",
  },
  "nested-rows": {
    concept:
      "Expandable statement rows with accrual sub-table; depth-indented chart of accounts",
    reason: "row expansion and tree grid",
    rendering: "approximation",
  },
  "nonlinear-stepper": {
    concept:
      "Ticket status stepper with branches (waiting, escalated, reopened)",
    reason: "the stepper is linear",
    rendering: "listed",
  },
  "time-inputs": {
    concept: "Time zone select, duration input, weekly hours editor",
    reason: "no timezone, duration or time part",
    rendering: "approximation",
  },
  "pdf-preview": {
    concept: "Attachment and PDF viewer",
    reason: "no viewer part",
    rendering: "badge",
  },
  "code-block": {
    concept: "Embed snippet and system prompt with copy",
    reason: "no code-block part",
    rendering: "approximation",
  },
};
