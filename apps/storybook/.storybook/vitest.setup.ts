import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { configure } from "storybook/test";
import * as projectAnnotations from "./preview";

// Several `play` functions wait for a real CSS close-transition (dialog/popover/select/etc.)
// plus base-ui's post-close focus-guard cleanup to finish before asserting the element is gone.
// Testing Library's default `asyncUtilTimeout` (1000ms) is tight enough that a loaded CI runner
// (shared vCPUs, no compositor) can miss it even though the transition itself is unchanged —
// widen the budget for every `waitFor`/`findBy*` in this project rather than per story.
configure({ asyncUtilTimeout: 5000 });

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
