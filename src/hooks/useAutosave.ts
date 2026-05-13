import { useEffect, useRef } from "react";
import type { DiagramType } from "../types";

const STORAGE_KEY = "dg-autosave";

export interface AutosaveData {
  source: string;
  diagramType: DiagramType;
  theme: "light" | "dark";
}

export function useAutosave(
  source: string,
  diagramType: DiagramType,
  theme: "light" | "dark"
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const data: AutosaveData = { source, diagramType, theme };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 2000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [source, diagramType, theme]);

  const handleBeforeUnload = () => {
    const data: AutosaveData = { source, diagramType, theme };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [source, diagramType, theme]);
}

export function loadAutosave(): AutosaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AutosaveData;
  } catch {
    return null;
  }
}
