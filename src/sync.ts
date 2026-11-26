import { useEffect, useReducer } from "react";

export function useStorageRefresh() {
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith("cipher-academy-")) refresh();
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
}
