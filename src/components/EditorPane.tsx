import { useRef, useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { Sparkles, X, Send, Loader2, ChevronDown, ChevronUp, ImagePlus } from "lucide-react";
import { useAiGenerate } from "../hooks/useAiGenerate";

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
}

export function EditorPane({ value, onChange, theme }: EditorPaneProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(newValue ?? "");
      }, 300);
    },
    [onChange]
  );

  const handleChunk = useCallback(
    (xml: string, _replace: boolean) => {
      onChange(xml);
    },
    [onChange]
  );

  const { generate, cancel, isGenerating, error } = useAiGenerate(handleChunk);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    generate(prompt.trim(), imageDataUrl ?? undefined);
  }, [prompt, imageDataUrl, generate]);

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImagePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) {
      const file = item.getAsFile();
      if (file) handleImageFile(file);
    }
  }, [handleImageFile]);

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider("xml", {
      provideCompletionItems: (model: import("monaco-editor").editor.ITextModel, position: import("monaco-editor").Position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const snippets = [
          {
            label: "bpmn:definitions",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" id="definitions" targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="Process_1" isExecutable="false">
    $0
  </process>
</definitions>`,
            detail: "BPMN definitions wrapper",
            range,
          },
          {
            label: "startEvent",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `<startEvent id="\${1:StartEvent_1}" name="\${2:Start}">
  <outgoing>\${3:Flow_1}</outgoing>
</startEvent>`,
            detail: "BPMN start event",
            range,
          },
          {
            label: "task",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `<task id="\${1:Task_1}" name="\${2:Task}">
  <incoming>\${3:Flow_1}</incoming>
  <outgoing>\${4:Flow_2}</outgoing>
</task>`,
            detail: "BPMN task",
            range,
          },
          {
            label: "exclusiveGateway",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `<exclusiveGateway id="\${1:Gateway_1}" name="\${2:Decision}">
  <incoming>\${3:Flow_1}</incoming>
  <outgoing>\${4:Flow_2}</outgoing>
  <outgoing>\${5:Flow_3}</outgoing>
</exclusiveGateway>`,
            detail: "BPMN exclusive gateway",
            range,
          },
          {
            label: "endEvent",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `<endEvent id="\${1:EndEvent_1}" name="\${2:End}">
  <incoming>\${3:Flow_1}</incoming>
</endEvent>`,
            detail: "BPMN end event",
            range,
          },
          {
            label: "sequenceFlow",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `<sequenceFlow id="\${1:Flow_1}" sourceRef="\${2:source}" targetRef="\${3:target}" />`,
            detail: "BPMN sequence flow",
            range,
          },
        ];

        return { suggestions: snippets };
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (aiOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [aiOpen]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* AI Panel */}
      <div className="shrink-0 border-b border-border">
        <button
          onClick={() => setAiOpen((o) => !o)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI Generate</span>
          <span className="ml-auto text-muted-foreground/60">
            {aiOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        {aiOpen && (
          <div
            className="px-3 pb-3 flex flex-col gap-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
                e.target.value = "";
              }}
            />

            {/* Image preview */}
            {imageDataUrl && (
              <div className="flex flex-col gap-1">
                <div className="relative w-full rounded-md overflow-hidden border border-input">
                  <img
                    src={imageDataUrl}
                    alt="context"
                    className="max-h-32 w-full object-contain bg-muted/30"
                  />
                  <button
                    onClick={() => setImageDataUrl(null)}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 hover:bg-destructive hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-amber-500 dark:text-amber-400">
                  Image is for your reference only — describe what you see in the prompt below. The AI model is text-only.
                </p>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handleImagePaste}
              placeholder="Describe the BPMN diagram… (⌘Enter to send, paste or drop an image for context)"
              rows={3}
              disabled={isGenerating}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <div className="flex items-center gap-2">
              {/* Upload image button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                title="Attach image"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ImagePlus className="h-3.5 w-3.5" />
              </button>

              <div className="flex-1" />

              {isGenerating && (
                <button
                  onClick={cancel}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Stop
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isGenerating ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="xml"
          value={value}
          onChange={handleChange}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          beforeMount={handleEditorWillMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            stickyScroll: { enabled: false },
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
}
