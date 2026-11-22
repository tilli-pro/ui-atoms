import { vi } from "vitest";

type Listener = (event: { matches: boolean }) => void;

interface MediaState {
  dark?: boolean;
  contrast?: boolean;
}

/**
 * Replaces `window.matchMedia` with one whose answers the test controls. The returned
 * `set` changes the answers and fires `change` on the affected queries, as the browser
 * does when the OS setting flips.
 */
export function mockMedia(initial: MediaState = {}) {
  const state = { dark: false, contrast: false, ...initial };
  const listeners = new Map<string, Set<Listener>>();
  const key = (query: string) =>
    query.includes("prefers-color-scheme") ? "dark" : "contrast";
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return state[key(query)];
      },
      media: query,
      addEventListener: (_: "change", listener: Listener) => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        listeners.get(query)?.add(listener);
      },
      removeEventListener: (_: "change", listener: Listener) => {
        listeners.get(query)?.delete(listener);
      },
    })),
  );
  return {
    set(next: MediaState) {
      Object.assign(state, next);
      for (const [query, set] of listeners)
        for (const listener of set) listener({ matches: state[key(query)] });
    },
    listenerCount: () =>
      [...listeners.values()].reduce((n, set) => n + set.size, 0),
  };
}

/** Lets queued MutationObserver callbacks run. */
export const flush = () => new Promise<void>((resolve) => setTimeout(resolve));
