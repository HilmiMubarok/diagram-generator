import {
  Moon,
  Sun,
  FileCode,
  ChevronDown,
  Workflow,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { DiagramType, Template } from "../types";

interface HeaderProps {
  diagramType: DiagramType;
  onDiagramTypeChange: (type: DiagramType) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onShare: () => void;
  onLoadTemplate: (template: Template) => void;
  templates: Template[];
}

export function Header({
  diagramType,
  onDiagramTypeChange,
  theme,
  onToggleTheme,
  onLoadTemplate,
  templates,
}: HeaderProps) {
  return (
    <TooltipProvider>
      <header className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card shrink-0 h-14">
        <div className="flex items-center gap-2 mr-4">
          <Workflow className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm hidden sm:inline">Diagram Generator</span>
        </div>

        <Select
          value={diagramType}
          onValueChange={(v) => onDiagramTypeChange(v as DiagramType)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bpmn">BPMN</SelectItem>
            <SelectItem value="sequence" disabled>
              Sequence (coming soon)
            </SelectItem>
            <SelectItem value="erd" disabled>
              ERD (coming soon)
            </SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
              <FileCode className="h-3.5 w-3.5" />
              Template
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {templates.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onLoadTemplate(t)}
                className="text-xs"
              >
                {t.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExportSvg}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export SVG</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExportPng}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export PNG</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy Share Link</TooltipContent>
        </Tooltip> */}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ganti Tema</TooltipContent>
        </Tooltip>
      </header>
    </TooltipProvider>
  );
}
