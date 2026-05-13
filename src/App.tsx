import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Header } from "./components/Header";
import { EditorPane } from "./components/EditorPane";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { useTheme } from "./hooks/useTheme";
import { useAutosave, loadAutosave } from "./hooks/useAutosave";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { bpmnTemplates } from "./lib/templates/bpmn";
import type { DiagramType, ValidationError, Template } from "./types";

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const bin = String.fromCharCode(...bytes);
  return btoa(bin);
}

function base64ToUtf8(str: string): string {
  const bin = atob(str);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeState(source: string, type: DiagramType, theme: "light" | "dark"): string {
  const payload = JSON.stringify({ source, type, theme });
  return utf8ToBase64(payload);
}

function decodeState(hash: string): { source: string; type: DiagramType; theme: "light" | "dark" } | null {
  try {
    const payload = base64ToUtf8(hash.slice(1));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function getInitialState(): { source: string; type: DiagramType } {
  if (window.location.hash) {
    const decoded = decodeState(window.location.hash);
    if (decoded) return { source: decoded.source, type: decoded.type };
  }
  const autosaved = loadAutosave();
  if (autosaved) return { source: autosaved.source, type: autosaved.diagramType };
  return { source: bpmnTemplates[0].source, type: "bpmn" };
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [source, setSource] = useState(getInitialState().source);
  const [diagramType, setDiagramType] = useState<DiagramType>(getInitialState().type);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useAutosave(source, diagramType, theme);

  const handleExportSvg = useCallback(() => {
    // Handled by DiagramCanvas via ref; we can trigger it if needed.
    // For now, we rely on the canvas toolbar buttons.
  }, []);

  const handleExportPng = useCallback(() => {
    // Same as above.
  }, []);

  const handleFitToScreen = useCallback(() => {
    // Same as above.
  }, []);

  const handleShare = useCallback(() => {
    const encoded = encodeState(source, diagramType, theme);
    window.location.hash = encoded;
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }, [source, diagramType, theme]);

  const handleLoadTemplate = useCallback((template: Template) => {
    setSource(template.source);
    setDiagramType(template.type);
  }, []);

  useKeyboardShortcuts({
    onToggleTheme: toggleTheme,
    onFitToScreen: handleFitToScreen,
  });

  useEffect(() => {
    if (window.location.hash) {
      const decoded = decodeState(window.location.hash);
      if (decoded) {
        setSource(decoded.source);
        setDiagramType(decoded.type);
      }
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      <Header
        diagramType={diagramType}
        onDiagramTypeChange={setDiagramType}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        onShare={handleShare}
        onLoadTemplate={handleLoadTemplate}
        templates={bpmnTemplates}
      />
      <PanelGroup direction="horizontal" className="flex-1 min-h-0">
        <Panel defaultSize={50} minSize={20} className="min-w-0">
          <EditorPane
            value={source}
            onChange={setSource}
            theme={theme}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />
        <Panel defaultSize={50} minSize={20} className="min-w-0">
          <DiagramCanvas
            xml={source}
            errors={errors}
            onErrors={setErrors}
            onXmlChange={setSource}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
