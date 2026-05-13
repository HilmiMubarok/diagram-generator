import { useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
}

export function EditorPane({ value, onChange, theme }: EditorPaneProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(newValue ?? "");
      }, 300);
    },
    [onChange]
  );

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    // Basic XML snippets for BPMN
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

  return (
    <div className="h-full w-full flex flex-col">
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
