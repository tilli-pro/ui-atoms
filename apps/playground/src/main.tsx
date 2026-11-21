import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./routes.js";
import "./styles.css";

// A hash router, with the relative `base` in vite.config.ts, lets one build
// run at any path (GitHub Pages serves it under `/ui-atoms/playground/`)
// with no server-side fallback for deep links.
const router = createHashRouter(routes);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
