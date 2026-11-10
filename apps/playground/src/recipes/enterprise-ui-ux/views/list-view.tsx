import { useMemo, useState } from "react";
import { Badge } from "@tilli.dev/ui-atoms/badge";
import { Button } from "@tilli.dev/ui-atoms/button";
import { Checkbox } from "@tilli.dev/ui-atoms/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@tilli.dev/ui-atoms/empty";
import { Frame, FrameFooter } from "@tilli.dev/ui-atoms/frame";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@tilli.dev/ui-atoms/input-group";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@tilli.dev/ui-atoms/menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@tilli.dev/ui-atoms/pagination";
import { SegmentedControl } from "@tilli.dev/ui-atoms/segmented-control";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tilli.dev/ui-atoms/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tilli.dev/ui-atoms/table";
import { ToggleGroup, ToggleGroupItem } from "@tilli.dev/ui-atoms/toggle-group";
import { Toolbar, ToolbarButton } from "@tilli.dev/ui-atoms/toolbar";
import { cn } from "@tilli.dev/ui-atoms/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpDown, Ellipsis, Search } from "lucide-react";
import { gaps } from "../gaps.js";
import {
  type ListSpec,
  type Persona,
  type Row,
  resolveLabel,
} from "../specs/types.js";
import { Cell, GapBadge } from "./cells.js";
import { GapPlaceholder } from "./gap-placeholder.js";
import {
  applySelects,
  PAGE_SIZE,
  pageWindow,
  readValue,
  type SortState,
  sortRows,
} from "./list-state.js";

type ListViewProps<R extends Row> = {
  spec: ListSpec<R>;
  persona: Persona;
  moduleTitle: string;
  Icon: LucideIcon;
};

export function ListView<R extends Row>(props: ListViewProps<R>) {
  return (
    <ListViewInner key={`${props.spec.key}:${props.persona.key}`} {...props} />
  );
}

function ListViewInner<R extends Row>({
  spec,
  persona,
  moduleTitle,
  Icon,
}: ListViewProps<R>) {
  const t = (label: Parameters<typeof resolveLabel>[0]) =>
    resolveLabel(label, persona.terms);

  const [segmentKey, setSegmentKey] = useState(spec.segments?.[0]?.key ?? "");
  const [chipKey, setChipKey] = useState("all");
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const segment = spec.segments?.find((s) => s.key === segmentKey);
  const columns = segment?.columns ?? spec.columns;
  const chips = segment?.chips ?? spec.chips;
  const selects = segment?.selects ?? spec.selects ?? [];
  const empty = segment?.empty ?? spec.empty;
  const totalFn = segment?.total ?? spec.total;
  const gapIds = [...(spec.gaps ?? []), ...(segment?.gaps ?? [])];

  const baseRows = useMemo(
    () => (segment ? segment.rows(persona) : spec.rows(persona)),
    [segment, spec, persona],
  );
  const selectedRows = useMemo(
    () => applySelects(baseRows, selects, chosen),
    [baseRows, selects, chosen],
  );
  const chip = chips.find((c) => c.key === chipKey);
  const chipRows = chip ? selectedRows.filter(chip.predicate) : selectedRows;
  const searched = useMemo(() => {
    const q = query.trim();
    return q ? chipRows.filter((row) => spec.search(row, q)) : chipRows;
  }, [chipRows, query, spec]);
  const sortColumn = columns.find((c) => c.key === sort?.key);
  const filtered = useMemo(
    () => sortRows(searched, sortColumn, sort?.dir ?? "asc"),
    [searched, sortColumn, sort],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const total = Math.max(totalFn ? totalFn(persona) : 0, filtered.length);

  const resetPage = () => setPage(1);
  const cycleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      return prev.dir === "asc" ? { key, dir: "desc" } : null;
    });
    resetPage();
  };

  const pageIds = pageRows.map((row) => row.id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) allSelected ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const placeholders = gapIds.filter(
    (id) => gaps[id].rendering === "placeholder",
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs uppercase">{moduleTitle}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 font-semibold text-2xl">
            <Icon className="size-6" />
            {t(spec.title)}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {spec.pageActions.map((action) => (
              <span
                className="inline-flex items-center gap-1.5"
                key={t(action.label)}
              >
                <Button size="sm" variant={action.variant ?? "outline"}>
                  {action.icon ? <action.icon /> : null}
                  {t(action.label)}
                </Button>
                {action.gap ? <GapBadge id={action.gap} /> : null}
              </span>
            ))}
          </div>
        </div>
        {spec.description ? (
          <p className="text-muted-foreground text-sm">{t(spec.description)}</p>
        ) : null}
        {gapIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {gapIds.map((id) => (
              <GapBadge id={id} key={id} />
            ))}
          </div>
        ) : null}
      </header>

      {spec.segments?.length ? (
        <SegmentedControl
          onChange={(value) => {
            setSegmentKey(value);
            setChipKey("all");
            setChosen({});
            setSelected(new Set());
            setSort(null);
            resetPage();
          }}
          options={spec.segments.map((s) => ({
            label: t(s.label),
            value: s.key,
          }))}
          value={segmentKey}
        />
      ) : null}

      {placeholders.map((id) => (
        <GapPlaceholder id={id} key={id} message={gaps[id].concept} />
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          onValueChange={(value: string[]) => {
            if (value[0]) {
              setChipKey(value[0]);
              resetPage();
            }
          }}
          size="sm"
          value={[chipKey]}
          variant="outline"
        >
          <ToggleGroupItem value="all">
            All
            <Badge size="sm" variant="secondary">
              {selectedRows.length}
            </Badge>
          </ToggleGroupItem>
          {chips.map((c) => (
            <ToggleGroupItem key={c.key} value={c.key}>
              {t(c.label)}
              <Badge size="sm" variant="secondary">
                {selectedRows.filter(c.predicate).length}
              </Badge>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Search"
            value={query}
          />
        </InputGroup>
        {selects.map((select) => {
          const items = [
            { value: "all", label: `All ${t(select.label)}` },
            ...select.options.map((o) => ({
              value: o.value,
              label: t(o.label),
            })),
          ];
          return (
            <Select
              items={items}
              key={select.key}
              onValueChange={(value) => {
                setChosen((prev) => ({ ...prev, [select.key]: String(value) }));
                resetPage();
              }}
              value={chosen[select.key] ?? "all"}
            >
              <SelectTrigger aria-label={t(select.label)} className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          );
        })}
      </div>

      {spec.selectable && selected.size > 0 ? (
        <Toolbar className="gap-2">
          <span className="px-2 text-sm">{selected.size} selected</span>
          <ToolbarButton render={<Button size="sm" variant="outline" />}>
            Export
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setSelected(new Set())}
            render={<Button size="sm" variant="outline" />}
          >
            Clear selection
          </ToolbarButton>
          <GapBadge id="data-grid" />
        </Toolbar>
      ) : null}

      <Frame>
        {filtered.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t(empty.title)}</EmptyTitle>
              <EmptyDescription>{t(empty.description)}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {spec.selectable ? (
                  <TableHead className="w-8">
                    <Checkbox
                      aria-label="Select all"
                      checked={allSelected}
                      indeterminate={selectedOnPage > 0 && !allSelected}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                ) : null}
                {columns.map((column) => (
                  <TableHead
                    className={cn(column.align === "end" && "text-end")}
                    key={column.key}
                  >
                    {column.sortable === false ? (
                      t(column.header)
                    ) : (
                      <Button
                        onClick={() => cycleSort(column.key)}
                        size="xs"
                        variant="ghost"
                      >
                        {t(column.header)}
                        <ArrowUpDown />
                      </Button>
                    )}
                  </TableHead>
                ))}
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.id}>
                  {spec.selectable ? (
                    <TableCell>
                      <Checkbox
                        aria-label="Select row"
                        checked={selected.has(row.id)}
                        onCheckedChange={() => toggleRow(row.id)}
                      />
                    </TableCell>
                  ) : null}
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
                        {spec.rowActions.map((action) => (
                          <MenuItem key={t(action.label)}>
                            {action.icon ? <action.icon /> : null}
                            {t(action.label)}
                            {action.gap ? <GapBadge id={action.gap} /> : null}
                          </MenuItem>
                        ))}
                      </MenuPopup>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <FrameFooter className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">
            {filtered.length === 0
              ? `Showing 0 of ${total}`
              : `Showing ${start + 1}–${start + pageRows.length} of ${total}`}
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={current === 1}
                  className={cn(
                    current === 1 && "pointer-events-none opacity-50",
                  )}
                  onClick={() => setPage(current - 1)}
                  render={<button type="button" />}
                />
              </PaginationItem>
              {pageWindow(current, pageCount).map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    isActive={n === current}
                    onClick={() => setPage(n)}
                    render={<button type="button" />}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  aria-disabled={current === pageCount}
                  className={cn(
                    current === pageCount && "pointer-events-none opacity-50",
                  )}
                  onClick={() => setPage(current + 1)}
                  render={<button type="button" />}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </FrameFooter>
      </Frame>
    </div>
  );
}
