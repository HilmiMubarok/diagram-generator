import { useEffect, useRef, useCallback, useState } from "react";
import BpmnJS from "bpmn-js/lib/Modeler";
import type Canvas from "diagram-js/lib/core/Canvas";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Download,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import type { ValidationError } from "../types";

interface DiagramCanvasProps {
  xml: string;
  errors: ValidationError[];
  onErrors: (errors: ValidationError[]) => void;
  onXmlChange: (xml: string) => void;
}

export function DiagramCanvas({ xml, errors, onErrors, onXmlChange }: DiagramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnJS | null>(null);
  const onErrorsRef = useRef(onErrors);
  const onXmlChangeRef = useRef(onXmlChange);
  // When true, skip the next importXML triggered by external xml prop change
  // (because the change originated from the canvas itself)
  const skipNextImport = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    onErrorsRef.current = onErrors;
    onXmlChangeRef.current = onXmlChange;
  });

  // Init modeler once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new BpmnJS({ container: containerRef.current });
    viewerRef.current = modeler;

    // Listen for any diagram change and emit updated XML to editor
    modeler.on("commandStack.changed", async () => {
      try {
        const { xml: updatedXml } = await modeler.saveXML({ format: true });
        if (updatedXml) {
          skipNextImport.current = true;
          onXmlChangeRef.current(updatedXml);
        }
      } catch {
        // ignore
      }
    });

    // Import initial XML
    setIsLoading(true);
    modeler
      .importXML(xml)
      .then(() => {
        onErrorsRef.current([]);
        modeler.get<Canvas>("canvas").zoom("fit-viewport");
      })
      .catch((err: Error) => {
        onErrorsRef.current([{ message: err.message }]);
      })
      .finally(() => setIsLoading(false));

    return () => {
      modeler.destroy();
      viewerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-import when xml prop changes externally (e.g. editor edits, template load, AI stream)
  // Debounced so rapid streaming chunks don't thrash the renderer
  useEffect(() => {
    const modeler = viewerRef.current;
    if (!modeler) return;

    // Skip if this change was emitted by the canvas itself
    if (skipNextImport.current) {
      skipNextImport.current = false;
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setIsLoading(true);
      modeler
        .importXML(xml)
        .then(() => {
          if (cancelled) return;
          onErrorsRef.current([]);
          modeler.get<Canvas>("canvas").zoom("fit-viewport");
        })
        .catch((err: Error) => {
          if (cancelled) return;
          onErrorsRef.current([{ message: err.message }]);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [xml]);

  const handleZoomIn = useCallback(() => {
    const canvas = viewerRef.current?.get<Canvas>("canvas");
    if (!canvas) return;
    const currentZoom = canvas.viewbox().scale;
    canvas.zoom(currentZoom * 1.2, { x: 0, y: 0 });
  }, []);

  const handleZoomOut = useCallback(() => {
    const canvas = viewerRef.current?.get<Canvas>("canvas");
    if (!canvas) return;
    const currentZoom = canvas.viewbox().scale;
    canvas.zoom(currentZoom * 0.8, { x: 0, y: 0 });
  }, []);

  const handleFitToScreen = useCallback(() => {
    viewerRef.current?.get<Canvas>("canvas").zoom("fit-viewport");
  }, []);

  const handleReset = useCallback(() => {
    viewerRef.current?.get<Canvas>("canvas").zoom("fit-viewport");
  }, []);

  const handleExportPng = useCallback(async () => {
    const modeler = viewerRef.current;
    if (!modeler) return;
    try {
      const { svg } = await modeler.saveSVG();
      const img = new Image();
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(2, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "diagram.png";
        a.click();
      };
      img.src = url;
    } catch {
      // ignore
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full relative">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Perbesar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Perkecil</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleFitToScreen}>
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sesuaikan Layar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Tampilan</TooltipContent>
          </Tooltip>
          <div className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleExportPng}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unduh PNG</TooltipContent>
          </Tooltip>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-background">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {errors.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 z-10 p-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive max-h-40 overflow-auto">
                <div className="font-medium mb-1">Aduh, ada error nih 😬</div>
                {errors.map((err, i) => (
                  <div key={i} className="font-mono text-xs">
                    {err.line ? `Baris ${err.line}: ` : ""}
                    {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </TooltipProvider>
  );
}
