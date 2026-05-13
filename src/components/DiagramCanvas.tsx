import { useEffect, useRef, useCallback, useState } from "react";
import BpmnJS from "bpmn-js/lib/Viewer";
import type Canvas from "diagram-js/lib/core/Canvas";
import { toPng } from "html-to-image";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  RotateCcw,
  Download,
  Image,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new BpmnJS({
      container: containerRef.current,
    });
    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    setIsLoading(true);
    viewer
      .importXML(xml)
      .then(() => {
        onErrors([]);
        viewer.get<Canvas>("canvas").zoom("fit-viewport");
      })
      .catch((err: Error) => {
        onErrors([{ message: err.message }]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [xml, onErrors]);

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

  const handleToggleFullscreen = useCallback(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const handleExportSvg = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      const { svg } = await viewer.saveSVG();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.svg";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
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
              <Button variant="ghost" size="icon" onClick={handleExportSvg}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export SVG</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleExportPng}>
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export PNG</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleToggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
          </Tooltip>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden p-4 bg-background">
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
                    {err.line ? `Line ${err.line}: ` : ""}{err.message}
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
