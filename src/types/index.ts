export type DiagramType = "bpmn" | "sequence" | "erd";

export interface ValidationError {
  message: string;
  line?: number;
}

export interface DiagramState {
  source: string;
  diagramType: DiagramType;
  theme: "light" | "dark";
  errors: ValidationError[];
}

export interface Template {
  id: string;
  name: string;
  type: DiagramType;
  source: string;
}
