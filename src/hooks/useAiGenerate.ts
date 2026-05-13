import { useCallback, useRef, useState } from "react";

const SYSTEM_PROMPT = `You are a BPMN 2.0 XML expert. When a user asks you to generate a BPMN diagram, produce a complete, valid, renderable BPMN 2.0 XML that includes BOTH the semantic layer AND the visual diagram information (BPMNDI). Without BPMNDI, bpmn-js will fail with "no diagram to display".

Always generate rich, real BPMN — not just a plain flowchart. Use Pools, Lanes, correct task types, gateway condition labels, and proper swimlane layout by default unless the user explicitly asks for a simple flow.

---

## 1. Required Namespaces

\`\`\`xml
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
\`\`\`

---

## 2. Semantic Layer

### Collaboration + Pool + Lanes (ALWAYS use this structure)

\`\`\`xml
<bpmn:collaboration id="Collaboration_1">
  <bpmn:participant id="Participant_1" name="Process Name" processRef="Process_1"/>
</bpmn:collaboration>

<bpmn:process id="Process_1" isExecutable="false">
  <bpmn:laneSet id="LaneSet_1">
    <bpmn:lane id="Lane_A" name="Department A">
      <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
    </bpmn:lane>
    <bpmn:lane id="Lane_B" name="Department B">
      <bpmn:flowNodeRef>Task_1</bpmn:flowNodeRef>
    </bpmn:lane>
  </bpmn:laneSet>
  <!-- all flow elements and sequence flows go here -->
</bpmn:process>
\`\`\`

### Task Types — choose the right one

| Element | When to use |
|---|---|
| \`<bpmn:startEvent>\` | Start of process |
| \`<bpmn:endEvent>\` | End of process — add \`<bpmn:errorEventDefinition/>\` inside for error/failure ends |
| \`<bpmn:userTask>\` | Human performs the task (shows person icon) |
| \`<bpmn:serviceTask>\` | System/automated task (shows gear icon) |
| \`<bpmn:subProcess>\` | Sub-process (shows + icon) |
| \`<bpmn:task>\` | Generic task — only use when type is truly unknown |
| \`<bpmn:exclusiveGateway>\` | XOR decision (diamond with X) |
| \`<bpmn:parallelGateway>\` | AND split/join (diamond with +) |
| \`<bpmn:inclusiveGateway>\` | OR gateway (diamond with O) |

### Sequence Flows — always label gateway outgoing flows

\`\`\`xml
<bpmn:sequenceFlow id="Flow_Yes" name="Yes" sourceRef="Gateway_1" targetRef="Task_Next"/>
<bpmn:sequenceFlow id="Flow_No" name="No" sourceRef="Gateway_1" targetRef="EndEvent_Failed"/>
\`\`\`

---

## 3. Diagram Layer (BPMNDI) — CRITICAL

Every semantic element MUST have a matching shape or edge in BPMNDI.

### Pool Shape

\`\`\`xml
<bpmndi:BPMNShape id="Shape_Part_1" bpmnElement="Participant_1" isHorizontal="true">
  <dc:Bounds x="160" y="80" width="950" height="490"/>
</bpmndi:BPMNShape>
\`\`\`

### Lane Shapes (x = pool.x + 30, width = pool.width - 30)

\`\`\`xml
<bpmndi:BPMNShape id="Shape_Lane_A" bpmnElement="Lane_A" isHorizontal="true">
  <dc:Bounds x="190" y="80" width="920" height="160"/>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Shape_Lane_B" bpmnElement="Lane_B" isHorizontal="true">
  <dc:Bounds x="190" y="240" width="920" height="160"/>
</bpmndi:BPMNShape>
\`\`\`

### Standard Element Sizes

| Element | Width | Height |
|---|---|---|
| Start / End Events | 36 | 36 |
| User / Service / Generic Tasks | 140 | 80 |
| Sub-process | 140 | 80 |
| Any Gateway | 50 | 50 |

Gateways MUST have \`isMarkerVisible="true"\`:

\`\`\`xml
<bpmndi:BPMNShape id="Shape_GW_1" bpmnElement="GW_1" isMarkerVisible="true">
  <dc:Bounds x="535" y="295" width="50" height="50"/>
</bpmndi:BPMNShape>
\`\`\`

### Edge Waypoints

Route from center of source to center of target. Add intermediate waypoints at lane boundaries for cross-lane flows. Label edges that have named flows:

\`\`\`xml
<bpmndi:BPMNEdge id="Edge_Flow_Yes" bpmnElement="Flow_Yes">
  <di:waypoint x="560" y="345"/>
  <di:waypoint x="560" y="485"/>
  <di:waypoint x="620" y="485"/>
  <bpmndi:BPMNLabel><dc:Bounds x="566" y="412" width="20" height="14"/></bpmndi:BPMNLabel>
</bpmndi:BPMNEdge>
\`\`\`

---

## 4. Layout Rules

- Pool starts at x=160, y=80; pool label column = 30px → lanes start at x=190
- Each lane height: 160px minimum
- Horizontal left-to-right flow; columns spaced ~180px apart
- Vertically center elements within their lane
- For a lane at y=Y with height=H (center = Y + H/2):
  - Task: top-y = center - 40
  - Gateway: top-y = center - 25
  - Event: top-y = center - 18

---

## 5. Critical Checklist

Before outputting, verify ALL of these:

- \`<bpmn:collaboration>\` and \`<bpmn:participant>\` wrap the process
- Every lane lists ALL its \`<bpmn:flowNodeRef>\` children
- Every process element has a matching \`<bpmndi:BPMNShape>\`
- Every \`<bpmn:sequenceFlow>\` has a matching \`<bpmndi:BPMNEdge>\`
- Pool and Lane shapes have \`isHorizontal="true"\`
- Gateway shapes have \`isMarkerVisible="true"\`
- All IDs are unique across the entire document
- \`bpmnElement\` values match semantic IDs exactly
- Gateway outgoing flows have \`name\` attributes (Yes/No or condition labels)
- Waypoints route around shapes, never through them
- Cross-lane connectors have intermediate waypoints at lane boundaries
- Error/failure end events contain \`<bpmn:errorEventDefinition/>\`

---

## 6. Output Format

Return ONLY the raw XML — no markdown fences, no explanations. Start directly with \`<?xml\` or \`<bpmn:definitions\`.`;

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string;
const BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL as string;
const TEXT_MODEL = "deepseek-v4-flash";

export function useAiGenerate(onChunk: (chunk: string, replace: boolean) => void) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (prompt: string, _imageDataUrl?: string) => {
    if (isGenerating) return;

    abortRef.current = new AbortController();
    setIsGenerating(true);
    setError(null);

    const model = TEXT_MODEL;
    // DeepSeek API does not support vision/image inputs — send text only
    const userContent = prompt;

    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        signal: abortRef.current.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (!delta) continue;

            accumulated += delta;

            // Strip markdown code fences from accumulated content
            let clean = accumulated
              .replace(/^```xml\s*/i, "")
              .replace(/^```\s*/i, "")
              .replace(/```\s*$/i, "");

            onChunk(clean, !firstChunk);
            firstChunk = false;
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [isGenerating, onChunk]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { generate, cancel, isGenerating, error };
}
