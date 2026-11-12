import { useState } from "react";
import {
  Sidebar,
  SidebarProvider,
  SidebarRail,
} from "@tilli.dev/ui-atoms/sidebar";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { Command } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  type ControlInput,
  type ControlType,
  useControl,
} from "../../control-panel/index.js";
import { type IconName, icons } from "./icons.js";
import {
  defaultIcons,
  homeOf,
  isModuleKey,
  type ModuleKey,
  moduleKeys,
  type SectionKey,
  sections,
} from "./modules.js";
import { ModulePanel } from "./panel.js";
import { isPersonaKey, personaKeys, personas } from "./personas.js";
import { Rail } from "./rail.js";
import { hashFor, routeFromHash } from "./routing.js";
import { moduleSpecs, specFor } from "./specs/index.js";
import {
  defaultGradients,
  type Gradient,
  isCssColor,
  NESTED_SIDEBAR_WIDTH,
} from "./theme.js";
import { DashboardView } from "./views/dashboard-view.js";
import { DetailView } from "./views/detail-view.js";
import { ListView } from "./views/list-view.js";
import { ContentView } from "./views.js";
import type { PersonaKey } from "./specs/types.js";

/**
 * Enterprise UI/UX: the authenticated shell of Enterprise, redesigned. An
 * icon rail of modules (Rail) beside the active module's menu (ModulePanel),
 * and a content area whose root view per module is that module's dashboard.
 * The active module and item live in the URL hash (routing.ts).
 */
export default function EnterpriseUiUx() {
  const [selected, setSelected] =
    useState<Record<SectionKey, IconName>>(defaultIcons);
  const location = useLocation();
  const navigate = useNavigate();
  const route = routeFromHash(location.hash);
  const active = route.module;
  const go = (hash: string): void =>
    void navigate(
      { hash, pathname: location.pathname, search: location.search },
      { replace: true },
    );
  const setActive = (key: ModuleKey): void => go(hashFor(key));
  const ActiveIcon =
    active === "enterprise" ? Command : icons[selected[active]];
  const [colorful, setColorful] = useState(true);
  const [inset, setInset] = useState(false);
  const [overview, setOverview] = useState(true);
  const [persona, setPersona] = useState<PersonaKey>("utilities");
  const [gradients, setGradients] =
    useState<Record<SectionKey, Gradient>>(defaultGradients);

  // One select control per section; picking an option swaps that rail icon.
  const controls = {} as Record<SectionKey, ControlInput<ControlType>>;
  for (const section of sections) {
    controls[section.key] = {
      value: selected[section.key],
      options: [...section.options],
      persist: true,
      onChange: (value) =>
        setSelected((prev) => ({ ...prev, [section.key]: value as IconName })),
    };
  }
  useControl(controls, { group: "sidebar icons", collapsed: false });
  useControl(
    {
      colorful: {
        value: colorful,
        persist: true,
        onChange: (value) => setColorful(value === true),
      },
      inset: {
        value: inset,
        persist: true,
        onChange: (value) => setInset(value === true),
      },
      // On: each module's overview is its first menu row and the panel header
      // is a label. Off: the panel header is the link to the overview.
      overview: {
        value: overview,
        persist: true,
        onChange: (value) => setOverview(value === true),
      },
      persona: {
        value: persona,
        options: [...personaKeys],
        persist: true,
        onChange: (value) => {
          if (typeof value === "string" && isPersonaKey(value))
            setPersona(value);
        },
      },
      active: {
        value: active,
        options: [...moduleKeys],
        onChange: (value) => {
          if (typeof value === "string" && isModuleKey(value)) setActive(value);
        },
      },
    },
    { group: "sidebar style", collapsed: false, order: -1 },
  );
  const gradientControls: Record<string, ControlInput<ControlType>> = {
    // Sorts first (order -1); the field values below follow it.
    "reset gradients": {
      type: "action",
      order: -1,
      actionProps: { children: "Reset to defaults" },
      onChange: () => setGradients(defaultGradients),
    },
  };
  for (const section of sections) {
    for (const stop of ["from", "to"] as const) {
      gradientControls[`${section.key}-${stop}`] = {
        type: "text",
        value: gradients[section.key][stop],
        persist: true,
        onChange: (value) => {
          if (typeof value !== "string" || !isCssColor(value)) return;
          setGradients((prev) => ({
            ...prev,
            [section.key]: { ...prev[section.key], [stop]: value.trim() },
          }));
        },
      };
    }
  }
  useControl(gradientControls, { group: "sidebar gradients", order: 1 });

  const itemSpec = route.item ? specFor(active, route.item) : undefined;
  const detailRow =
    route.id && itemSpec?.detail
      ? itemSpec.rows(personas[persona]).find((row) => row.id === route.id)
      : undefined;
  const moduleSpec = moduleSpecs[active];
  const { title, blurb } = homeOf(active);
  const mainView = () => {
    if (route.item && itemSpec?.detail && detailRow) {
      return (
        <DetailView
          backHash={hashFor(active, route.item)}
          Icon={route.item.icon}
          itemLabel={route.item.label}
          moduleTitle={title}
          onNavigate={go}
          persona={personas[persona]}
          row={detailRow}
          spec={itemSpec.detail}
        />
      );
    }
    if (route.item && itemSpec) {
      return (
        <ListView
          Icon={route.item.icon}
          moduleTitle={title}
          onOpenRow={
            itemSpec.detail
              ? (row) => go(hashFor(active, route.item, row.id))
              : undefined
          }
          persona={personas[persona]}
          spec={itemSpec}
        />
      );
    }
    if (!route.item) {
      return (
        <DashboardView
          blurb={blurb}
          Icon={ActiveIcon}
          persona={personas[persona]}
          spec={moduleSpec.dashboard(personas[persona])}
          title={title}
        />
      );
    }
    return null;
  };

  return (
    <div className="flex h-full w-full flex-col">
      <SidebarProvider
        style={
          { "--sidebar-width": NESTED_SIDEBAR_WIDTH } as React.CSSProperties
        }
      >
        {/* The outer sidebar holds the rail and the panel side by side; its variant follows the inset control. */}
        <Sidebar
          className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
          collapsible="icon"
          variant={inset ? "inset" : "sidebar"}
        >
          <Rail
            active={active}
            colorful={colorful}
            gradients={gradients}
            onSelectItem={(module, item) => go(hashFor(module, item))}
            onSelectModule={setActive}
            overviewItem={overview}
            selected={selected}
            useInset={inset}
          />
          <ModulePanel
            ActiveIcon={ActiveIcon}
            colorful={colorful}
            gradients={gradients}
            onSelectItem={(module, item) => go(hashFor(module, item))}
            onSelectModule={setActive}
            overviewItem={overview}
            route={route}
            useInset={inset}
          />
          <SidebarRail />
        </Sidebar>
        <ContentView useInset={inset}>
          <main className={cn("p-4 md:p-6")}>{mainView()}</main>
        </ContentView>
      </SidebarProvider>
    </div>
  );
}
