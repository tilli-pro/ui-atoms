import type * as React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "../../utils.js";

export type SpinnerProps = React.ComponentProps<typeof Loader2Icon>;

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      aria-label="Loading"
      // Upstream dropped the hardcoded size so Spinner inherits the button's
      // icon scale. Keeping `size-4` costs one token and stops every standalone
      // <Spinner /> jumping 16px → 24px with no compile error (SPN-1).
      className={cn("size-4 animate-spin", className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
