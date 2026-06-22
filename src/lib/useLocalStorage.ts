"use client";

import * as React from "react";

/**
 * SSR-safe localStorage state. Reads once on mount (so server & first client render match),
 * then persists on change. `hydrated` lets callers avoid flashing default content.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  /** Optional normalizer applied to parsed storage (e.g. to backfill newly added fields). */
  migrate?: (raw: unknown) => T,
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = React.useState<T>(initialValue);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        const next = migrate ? migrate(parsed) : (parsed as T);
        // Reading persisted state from localStorage on mount is a legitimate external-system
        // sync; this is the canonical pattern for SSR-safe hydration of client-only storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(next);
      }
    } catch {
      // Ignore malformed/unavailable storage and fall back to the initial value.
    }
    setHydrated(true);
    // migrate is a stable module-level function; intentionally not in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota / availability errors.
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
