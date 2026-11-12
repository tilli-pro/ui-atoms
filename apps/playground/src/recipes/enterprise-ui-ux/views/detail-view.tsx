import { useMemo, useState } from "react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@tilli.dev/ui-atoms/alert";
import { Avatar, AvatarFallback } from "@tilli.dev/ui-atoms/avatar";
import { Badge } from "@tilli.dev/ui-atoms/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tilli.dev/ui-atoms/breadcrumb";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@tilli.dev/ui-atoms/menu";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@tilli.dev/ui-atoms/tooltip";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import {
  type ActionSpec,
  type CardContent as CardContentSpec,
  type CardSpec,
  type DetailSpec,
  type Field,
  type Persona,
  type Row,
  resolveLabel,
} from "../specs/types.js";
import { alertVariantOf, badgeVariantOf, Cell, GapBadge } from "./cells.js";
import { DetailTabs } from "./detail-tabs.js";
import { GapPlaceholder } from "./gap-placeholder.js";
import { RowPanel } from "./row-panel.js";

export type DetailViewProps<R extends Row, D> = {
  spec: DetailSpec<R, D>;
  row: R;
  persona: Persona;
  moduleTitle: string;
  itemLabel: string;
  Icon: LucideIcon;
  backHash: string;
  onNavigate: (hash: string) => void;
};

export function DetailView<R extends Row, D>(props: DetailViewProps<R, D>) {
  return (
    <DetailViewInner
      key={`${props.spec.key}:${props.row.id}:${props.persona.key}`}
      {...props}
    />
  );
}

function DetailViewInner<R extends Row, D>({
  spec,
  row,
  persona,
  moduleTitle,
  itemLabel,
  backHash,
  onNavigate,
}: DetailViewProps<R, D>) {
  const t = (label: Parameters<typeof resolveLabel>[0]) =>
    resolveLabel(label, persona.terms);
  const [panel, setPanel] = useState<{ row: R; action: ActionSpec<R> } | null>(
    null,
  );

  const d = useMemo(() => spec.load(row, persona), [spec, row, persona]);
  const header = spec.header(d, persona);
  const alert = spec.alert?.(d, persona) ?? null;
  const fields = spec.summary(d, persona);
  const menu = spec.menu(persona);
  const moduleHash = backHash.split("/").slice(0, 2).join("/");

  const crumb = (href: string) => ({
    href,
    onClick: (e: { preventDefault: () => void }) => {
      e.preventDefault();
      onNavigate(href);
    },
  });
  const openPanel = (action: ActionSpec<R>) => {
    if (action.panel) setPanel({ row, action });
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink {...crumb(moduleHash)}>
              {moduleTitle}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink {...crumb(backHash)}>{itemLabel}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{header.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{header.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="flex flex-wrap items-center gap-2 font-semibold text-2xl">
              {header.title}
              {header.badges.map((b) => (
                <Badge
                  key={t(b.label)}
                  variant={badgeVariantOf[b.tone ?? "neutral"]}
                >
                  {t(b.label)}
                </Badge>
              ))}
            </h1>
            {header.subtitle ? (
              <p className="text-muted-foreground text-sm">{header.subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {spec.actions.map((action) => {
            const label = t(action.label);
            const button = (
              <Button
                onClick={() => openPanel(action as ActionSpec<R>)}
                size="sm"
                variant={action.variant ?? "outline"}
              >
                {action.icon ? <action.icon /> : null}
                {label}
              </Button>
            );
            return (
              <span className="inline-flex items-center gap-1.5" key={label}>
                {label === "Refresh" ? (
                  <Tooltip>
                    <TooltipTrigger render={button} />
                    <TooltipPopup>Synced recently</TooltipPopup>
                  </Tooltip>
                ) : (
                  button
                )}
                {action.gap ? <GapBadge id={action.gap} /> : null}
              </span>
            );
          })}
          <Menu>
            <MenuTrigger render={<Button size="sm" />}>
              Actions
              <ChevronDown />
            </MenuTrigger>
            <MenuPopup align="end">
              {menu.map((action, index) =>
                action === null ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: separators have no identity
                  <MenuSeparator key={`sep-${index}`} />
                ) : (
                  <MenuItem
                    key={t(action.label)}
                    onClick={() => openPanel(action as ActionSpec<R>)}
                  >
                    {action.icon ? <action.icon /> : null}
                    {t(action.label)}
                    {action.gap ? <GapBadge id={action.gap} /> : null}
                  </MenuItem>
                ),
              )}
            </MenuPopup>
          </Menu>
        </div>
      </div>

      {spec.gaps && spec.gaps.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {spec.gaps.map((id) => (
            <GapBadge id={id} key={id} />
          ))}
        </div>
      ) : null}

      {alert ? (
        <Alert variant={alertVariantOf[alert.tone]}>
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
          <AlertAction>
            {alert.actions.map((action) => (
              <span
                className="inline-flex items-center gap-1.5"
                key={t(action.label)}
              >
                <Button
                  onClick={() => openPanel(action as ActionSpec<R>)}
                  size="sm"
                  variant="outline"
                >
                  {action.icon ? <action.icon /> : null}
                  {t(action.label)}
                </Button>
                {action.gap ? <GapBadge id={action.gap} /> : null}
              </span>
            ))}
          </AlertAction>
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {fields.map((field) => (
              <FieldItem field={field} key={t(field.label)} persona={persona} />
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          {spec.cards
            .filter((c) => c.column === "main")
            .map((card) => (
              <DetailCard card={card} d={d} key={card.key} persona={persona} />
            ))}
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          {spec.cards
            .filter((c) => c.column === "side")
            .map((card) => (
              <DetailCard card={card} d={d} key={card.key} persona={persona} />
            ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <DetailTabs d={d} persona={persona} tabs={spec.tabs} />
        </CardContent>
      </Card>

      <RowPanel
        onClose={() => setPanel(null)}
        panel={panel}
        persona={persona}
      />
    </div>
  );
}

function FieldItem({ field, persona }: { field: Field; persona: Persona }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs uppercase">
        {resolveLabel(field.label, persona.terms)}
        {field.gap ? (
          <>
            {" "}
            <GapBadge id={field.gap} />
          </>
        ) : null}
      </dt>
      <dd className="text-sm">
        <Cell
          currency={persona.currency}
          format={field.format}
          value={field.value}
        />
        {field.hint ? (
          <span className="block text-muted-foreground text-xs">
            {resolveLabel(field.hint, persona.terms)}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

function DetailCard<D>({
  card,
  d,
  persona,
}: {
  card: CardSpec<D>;
  d: D;
  persona: Persona;
}) {
  const content = card.content(d);
  if (content.kind === "fields" && content.fields.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {resolveLabel(card.title, persona.terms)}
          {card.gap ? (
            <>
              {" "}
              <GapBadge id={card.gap} />
            </>
          ) : null}
        </CardTitle>
        {card.description ? (
          <CardDescription>
            {resolveLabel(card.description, persona.terms)}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <CardBody content={content} persona={persona} />
      </CardContent>
    </Card>
  );
}

function CardBody({
  content,
  persona,
}: {
  content: CardContentSpec;
  persona: Persona;
}) {
  switch (content.kind) {
    case "fields":
      return (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {content.fields.map((field) => (
            <FieldItem
              field={field}
              key={resolveLabel(field.label, persona.terms)}
              persona={persona}
            />
          ))}
        </dl>
      );
    case "list":
      return content.items.length === 0 ? (
        <ul className="divide-y">
          <li className="py-2 text-muted-foreground text-sm">None</li>
        </ul>
      ) : (
        <ul className="divide-y">
          {content.items.map((item) => (
            <li
              className="flex items-center justify-between gap-3 py-2"
              key={`${item.label}:${item.value}`}
            >
              <div className="flex min-w-0 flex-col">
                <span className="font-medium text-sm">{item.label}</span>
                {item.hint ? (
                  <span className="text-muted-foreground text-xs">
                    {item.hint}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-sm">
                {item.value}
                {item.badge ? (
                  <Badge variant={badgeVariantOf[item.badge.tone ?? "neutral"]}>
                    {resolveLabel(item.badge.label, persona.terms)}
                  </Badge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      );
    default:
      return <GapPlaceholder id={content.gap} message={content.message} />;
  }
}
