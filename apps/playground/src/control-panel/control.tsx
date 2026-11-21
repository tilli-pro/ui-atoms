import { Button } from "@tilli.dev/ui-atoms/button";
import { Input } from "@tilli.dev/ui-atoms/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tilli.dev/ui-atoms/select";
import { Switch } from "@tilli.dev/ui-atoms/switch";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { observer } from "mobx-react-lite";
import { ControlColor } from "./control.color.js";
import {
  type Control,
  type ControlType,
  controlContext,
} from "./control-context.js";
import { xsInputClassName, xsSelectTriggerClassName } from "./control-sizes.js";

interface ControlFieldProps<T extends ControlType> {
  controlKey: string;
  control: Control<T>;
  disabled?: boolean | undefined;
}

export const ControlInput: React.FC<ControlFieldProps<"text">> = observer(
  ({ controlKey, control, disabled }) => {
    return (
      <Input
        className={xsInputClassName}
        disabled={disabled}
        onChange={(event) =>
          controlContext.setControlValue(controlKey, event.target.value)
        }
        size="sm"
        value={control.value?.get() ?? ""}
      />
    );
  },
);

export const ControlSelect: React.FC<ControlFieldProps<"select">> = observer(
  ({ controlKey, control, disabled }) => {
    return (
      <Select
        disabled={disabled}
        onValueChange={(value) =>
          controlContext.setControlValue(controlKey, value ?? "")
        }
        value={control.value?.get()?.toString()}
      >
        <SelectTrigger
          className={cn(xsSelectTriggerClassName, "w-full")}
          size="sm"
        >
          <SelectValue className="text-[10px]" placeholder="Select an option" />
        </SelectTrigger>
        <SelectPopup>
          {control.options?.map((option) => (
            <SelectItem key={option.toString()} value={option.toString()}>
              {option.toString()}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    );
  },
);

export const ControlSwitch: React.FC<ControlFieldProps<"switch">> = observer(
  ({ controlKey, control, disabled }) => {
    return (
      <Switch
        checked={control.value?.get() ?? false}
        disabled={disabled}
        onCheckedChange={(value) =>
          controlContext.setControlValue(controlKey, value)
        }
        style={{ "--thumb-size": "0.75rem" } as React.CSSProperties}
      />
    );
  },
);

export const ControlAction: React.FC<ControlFieldProps<"action">> = observer(
  ({ controlKey, disabled, control }) => {
    const value = control.value?.get();
    const actionComponents = controlContext.getActionComponents(controlKey);
    return (
      <Button
        className="h-5! w-full text-[10px]! uppercase"
        disabled={disabled}
        loading={control.pending ?? false}
        onClick={() =>
          controlContext.setControlValue(controlKey, `${Date.now()}`)
        }
        size="xs"
        variant="outline"
        {...control.actionProps}
      >
        {actionComponents?.children
          ? actionComponents.children
          : value
            ? `Last: ${new Date(Number(value)).toLocaleTimeString()}`
            : "Trigger"}
      </Button>
    );
  },
);

export const ControlRenderer: React.FC<ControlFieldProps<ControlType>> = ({
  controlKey,
  control,
  disabled,
}) => {
  // `control.type` is resolved once at registration (see `registerControl`).
  switch (control.type) {
    case "text":
      return (
        <ControlInput
          control={control as Control<"text">}
          controlKey={controlKey}
          disabled={disabled}
        />
      );
    case "select":
      return (
        <ControlSelect
          control={control as Control<"select">}
          controlKey={controlKey}
          disabled={disabled}
        />
      );
    case "switch":
      return (
        <ControlSwitch
          control={control as Control<"switch">}
          controlKey={controlKey}
          disabled={disabled}
        />
      );
    case "color":
      return (
        <ControlColor
          control={control as Control<"color">}
          controlKey={controlKey}
          disabled={disabled}
        />
      );
    case "action":
      return (
        <ControlAction
          control={control as Control<"action">}
          controlKey={controlKey}
          disabled={disabled}
        />
      );
    default:
      return (
        <div className="text-center text-[10px] uppercase">
          unsupported: {control.type}
        </div>
      );
  }
};
