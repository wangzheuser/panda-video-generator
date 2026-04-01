"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

const PREFIX = "pvg:wizard:";

/**
 * Persist a JSON-serializable object to localStorage. Loads after mount to avoid SSR mismatch.
 * `defaultValue` and `normalize` must be stable references (define outside the component).
 */
export function usePersistedJson<T extends Record<string, unknown>>(
  storageKey: string,
  defaultValue: T,
  normalize?: (raw: unknown, defaults: T) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const key = PREFIX + storageKey;
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      let next: T;
      if (normalize) {
        next = normalize(parsed, defaultValue);
      } else if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        next = { ...defaultValue, ...(parsed as Partial<T>) };
      } else {
        next = defaultValue;
      }
      setValue(next);
    } catch {
      /* ignore corrupt LS */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode */
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}
