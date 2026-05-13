import { useEffect, useRef, useCallback, useState } from "react";
import BpmnJS from "bpmn-js/lib/NavigatedViewer";
import type Canvas from "diagram-js/lib/core/Canvas";
import { toPng } from "html-to-image";
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
}

export function DiagramCanvas({ xml, errors, onErrors }: DiagramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnJS | null>(null);
  const onErrorsRef = useRef(onErrors);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    onErrorsRef.current = onErrors;
  });

  // Init viewer once and import initial XML, then re-import on xml changes
  useEffect(() => {
    if (!containerRef.current) return;

    let viewer = viewerRef.current;
    let created = false;
    if (!viewer) {
      viewer = new BpmnJS({ container: containerRef.current });
      viewerRef.current = viewer;
      created = true;
    }

    let cancelled = false;
    setIsLoading(true);
    viewer
      .importXML(xml)
      .then(() => {
        if (cancelled) return;
        onErrorsRef.current([]);
        viewer!.get<Canvas>("canvas").zoom("fit-viewport");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        onErrorsRef.current([{ message: err.message }]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      if (created) {
        viewer!.destroy();
        viewerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const el = containerRef.current;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "diagram.png";
      a.click();
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
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleFitToScreen}>
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to Screen</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
          <div className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleExportPng}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export PNG</TooltipContent>
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
                <div className="font-medium mb-1">Diagram Errors</div>
                {errors.map((err, i) => (
                  <div key={i} className="font-mono text-xs">
                    {err.line ? `Line ${err.line}: ` : ""}
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
