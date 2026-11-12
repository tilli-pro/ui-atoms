import { useState } from "react";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@tilli.dev/ui-atoms/empty";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@tilli.dev/ui-atoms/menu";
import { SegmentedControl } from "@tilli.dev/ui-atoms/segmented-control";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tilli.dev/ui-atoms/table";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@tilli.dev/ui-atoms/tabs";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { Ellipsis } from "lucide-react";
import {
  type Persona,
  resolveLabel,
  type TabContent,
  type TabSpec,
} from "../specs/types.js";
import { Cell, GapBadge } from "./cells.js";
import { TabTimeline } from "./detail-timeline.js";
import { GapPlaceholder } from "./gap-placeholder.js";
import {
  PAGE_SIZE,
  readValue,
  type SortState,
  sortRows,
} from "./list-state.js";
import { ListPagination, SortableHead } from "./table-parts.js";

type Translate = (label: Parameters<typeof resolveLabel>[0]) => string;

const useTranslate = (persona: Persona): Translate => {
  return (label) => resolveLabel(label, persona.terms);
};

export function DetailTabs<D>({
  tabs,
  d,
  persona,
}: {
  tabs: TabSpec<D>[];
  d: D;
  persona: Persona;
}) {
  const t = useTranslate(persona);
  const [active, setActive] = useState(tabs.at(0)?.key ?? "");
  return (
    <Tabs onValueChange={(value) => setActive(String(value))} value={active}>
      <TabsList variant="underline">
        {tabs.map((tab) => (
          <TabsTab key={tab.key} value={tab.key}>
            {t(tab.label)}
            {tab.gap ? <GapBadge id={tab.gap} /> : null}
          </TabsTab>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsPanel className="pt-4" key={tab.key} value={tab.key}>
          <TabBody d={d} persona={persona} tab={tab} />
        </TabsPanel>
      ))}
    </Tabs>
  );
}

function TabBody<D>({
  tab,
  d,
  persona,
}: {
  tab: TabSpec<D>;
  d: D;
  persona: Persona;
}) {
  const t = useTranslate(persona);
  const [segmentKey, setSegmentKey] = useState(tab.segments.at(0)?.key ?? "");
  const segment =
    tab.segments.find((s) => s.key === segmentKey) ?? tab.segments.at(0);
  if (!segment) return null;
  return (
    <div className="flex flex-col gap-4">
      {tab.segments.length > 1 ? (
        <SegmentedControl
          onChange={setSegmentKey}
          options={tab.segments.map((s) => ({
            label: t(s.label),
            value: s.key,
          }))}
          value={segment.key}
        />
      ) : null}
      <TabContentView
        content={segment.content}
        d={d}
        key={`${tab.key}:${segment.key}`}
        persona={persona}
      />
    </div>
  );
}

function TabContentView<D>({
  content,
  d,
  persona,
}: {
  content: TabContent<D>;
  d: D;
  persona: Persona;
}) {
  switch (content.kind) {
    case "table":
      return <TabTable content={content} d={d} persona={persona} />;
    case "timeline":
      return <TabTimeline content={content} d={d} persona={persona} />;
    case "placeholder":
      return <GapPlaceholder id={content.gap} message={content.message} />;
    default:
      return null;
  }
}

function TabTable<D>({
  content,
  d,
  persona,
}: {
  content: Extract<TabContent<D>, { kind: "table" }>;
  d: D;
  persona: Persona;
}) {
  const t = useTranslate(persona);
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const { columns, rowActions, empty } = content;

  const rows = content.rows(d);
  const sortColumn = columns.find((c) => c.key === sort?.key);
  const sorted = sortRows(rows, sortColumn, sort?.dir ?? "asc");
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(Math.max(page, 1), pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(start, start + PAGE_SIZE);
  const hasActions = (rowActions?.length ?? 0) > 0;

  const cycleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      return prev.dir === "asc" ? { key, dir: "desc" } : null;
    });
    setPage(1);
  };

  if (sorted.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t(empty.title)}</EmptyTitle>
          <EmptyDescription>{t(empty.description)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <SortableHead
                column={column}
                key={column.key}
                label={t(column.header)}
                onSort={cycleSort}
              />
            ))}
            {hasActions ? (
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  className={cn(column.align === "end" && "text-end")}
                  key={column.key}
                >
                  <Cell
                    currency={persona.currency}
                    format={column.format}
                    value={readValue(column, row)}
                  />
                </TableCell>
              ))}
              {hasActions ? (
                <TableCell>
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button
                          aria-label="Actions"
                          size="icon"
                          variant="ghost"
                        />
                      }
                    >
                      <Ellipsis />
                    </MenuTrigger>
                    <MenuPopup align="end">
                      {rowActions?.map((action) => (
                        <MenuItem key={t(action.label)}>
                          {action.icon ? <action.icon /> : null}
                          {t(action.label)}
                          {action.gap ? <GapBadge id={action.gap} /> : null}
                        </MenuItem>
                      ))}
                    </MenuPopup>
                  </Menu>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm tabular-nums">
          {`Showing ${start + 1}–${start + pageRows.length} of ${sorted.length}`}
        </p>
        {pageCount > 1 ? (
          <ListPagination
            onPage={setPage}
            page={current}
            pageCount={pageCount}
          />
        ) : null}
      </div>
    </div>
  );
}
