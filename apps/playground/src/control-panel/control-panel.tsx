import { useRef, useState } from "react";
import { Kbd } from "@tilli.dev/ui-atoms/kbd";
import { ScrollArea } from "@tilli.dev/ui-atoms/scroll-area";
import { observer } from "mobx-react-lite";
import {
  AnimatePresence,
  motion,
  type TargetAndTransition,
} from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";
import { controlContext } from "./control-context.js";
import { ControlGroup } from "./control-group.js";
import { ControlRow } from "./control-row.js";

const PANEL_CONTAINER_CLASS =
  "fixed right-1/2 bottom-4 z-50 flex origin-bottom translate-x-1/2 flex-col items-center";

const STORAGE_KEY = "panelVisible";
const APPLE_PLATFORM = /mac|iphone|ipad|ipod/i;
const HIDDEN: TargetAndTransition = {
  opacity: 0,
  scale: 0.95,
  translateY: 40,
  rotateY: -15,
};

/** Cmd on Apple platforms, Ctrl elsewhere; `mod+k` is the matching hotkey. */
const isApplePlatform = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform;
  return APPLE_PLATFORM.test(platform);
};

const readVisible = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const PanelBody: React.FC<{ hotkeyLabel: string }> = observer(
  ({ hotkeyLabel }) => (
    <>
      <h4 className="mb-2 flex w-fit gap-2 rounded border border-border bg-background/25 px-4 py-1 text-right font-mono font-thin text-sm backdrop-blur-lg">
        <span>control panel</span>
        <Kbd>{hotkeyLabel}</Kbd>
      </h4>
      <ScrollArea className="h-[calc(100vh-14rem)] w-[calc(100vw-2rem)] rounded-lg border border-border bg-background/80 p-4 font-mono backdrop-blur-sm md:h-64 md:w-84 lg:w-96">
        <div className="flex flex-col gap-y-1.5">
          {controlContext
            .orderedGroups()
            .map(({ id, options, entries }) =>
              options.group ? (
                <ControlGroup
                  defaultCollapsed={options.collapsed ?? true}
                  entries={entries}
                  key={id}
                  label={
                    typeof options.group === "string" ? options.group : "group"
                  }
                />
              ) : (
                entries.map(([key, control]) => (
                  <ControlRow control={control} controlKey={key} key={key} />
                ))
              ),
            )}
        </div>
      </ScrollArea>
    </>
  ),
);
PanelBody.displayName = "PanelBody";

/**
 * The floating panel every `useControl` call renders into. Mount it once;
 * `mod+k` (Cmd+K on macOS, Ctrl+K elsewhere) toggles it and the choice is
 * remembered in localStorage.
 */
export const ControlPanel: React.FC = observer(() => {
  const [visible, setVisible] = useState(readVisible);
  // `false` on first paint so a panel restored from storage does not animate in;
  // the hotkey switches it to the hidden pose so later toggles do.
  const enterFrom = useRef<false | TargetAndTransition>(false);
  const hotkeyLabel = useRef(isApplePlatform() ? "⌘K" : "CTRL+K");

  useHotkeys("mod+k", (event) => {
    event.preventDefault();
    setVisible((prev) => {
      const next = !prev;
      enterFrom.current = HIDDEN;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
      } catch {
        /* no-op */
      }
      return next;
    });
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={{ opacity: 1, scale: 1, translateY: 0, rotateY: 0 }}
          className={PANEL_CONTAINER_CLASS}
          exit={HIDDEN}
          initial={enterFrom.current}
          transition={{ duration: 0.2 }}
        >
          <PanelBody hotkeyLabel={hotkeyLabel.current} />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
ControlPanel.displayName = "ControlPanel";
