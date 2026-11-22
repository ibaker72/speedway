"use client";

import { useSyncExternalStore } from "react";

const KEY = "speedway-staff-name";
const listeners = new Set<() => void>();
let memory = ""; // used when localStorage is unavailable (private mode, blocked storage)

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Who is making a change, remembered on this device (there are no per-user staff accounts). */
export function useStaffName(): [string, (name: string) => void] {
  const name = useSyncExternalStore(subscribe, read, () => "");
  return [
    name,
    (value: string) => {
      memory = value;
      try {
        window.localStorage.setItem(KEY, value);
      } catch {
        // keep the in-memory value
      }
      listeners.forEach((listener) => listener());
    },
  ];
}
