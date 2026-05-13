import { useEffect } from "react";

interface Shortcuts {
  onExportSvg?: () => void;
  onExportPng?: () => void;
  onToggleTheme?: () => void;
  onFitToScreen?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isMeta && isShift && e.key.toLowerCase() === "e") {
        e.preventDefault();
        shortcuts.onExportSvg?.();
      }
      if (isMeta && isShift && e.key.toLowerCase() === "l") {
        e.preventDefault();
        shortcuts.onToggleTheme?.();
      }
      if (isMeta && e.key === "0") {
        e.preventDefault();
        shortcuts.onFitToScreen?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
