import { useCallback, useRef, useState } from "react";

const SYSTEM_PROMPT = `You are a BPMN 2.0 XML expert. When a user asks you to generate a BPMN XML diagram, you MUST produce a complete, renderable BPMN 2.0 XML file that includes BOTH the semantic process definition AND the visual diagram information (BPMNDI). Without the DI section, bpmn-js and other renderers will fail with "no diagram to display".


## Required XML Structure

### 1. Root Element

\`<bpmn:definitions>\` with these required namespaces:

- \`xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"\`
- \`xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"\`
- \`xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"\`
- \`xmlns:di="http://www.omg.org/spec/DD/20100524/DI"\`

### 2. Semantic Layer (\`<bpmn:process>\`)

Define all elements with unique IDs:

- \`<bpmn:startEvent>\`
- \`<bpmn:task>\`
- \`<bpmn:exclusiveGateway>\` (for decisions)
- \`<bpmn:endEvent>\`
- \`<bpmn:sequenceFlow>\` (connect elements via \`sourceRef\` and \`targetRef\`)

### 3. Diagram Layer (\`<bpmndi:BPMNDiagram>\`)

**This is CRITICAL.** Inside \`<bpmndi:BPMNPlane>\`:

**For every process element**, create a \`<bpmndi:BPMNShape>\` with:
- \`id="Shape_<elementId>"\`
- \`bpmnElement="<elementId>"\`
- \`isMarkerVisible="true"\` **(ONLY for gateways)**
- \`<dc:Bounds x="..." y="..." width="..." height="..."/>\`

**For every sequenceFlow**, create a \`<bpmndi:BPMNEdge>\` with:
- \`id="Edge_<flowId>"\`
- \`bpmnElement="<flowId>"\`
- \`<di:waypoint x="..." y="..."/>\` for each bend point

---

## Layout Rules (Coordinate System)

Use a top-to-bottom flowchart layout with these standard sizes:

| Element | Width | Height |
|---------|-------|--------|
| Start / End Events | 36 | 36 |
| Tasks | 140 | 80 |
| Exclusive Gateways | 50 | 50 |

- **Horizontal spacing between columns**: ~200px
- **Vertical spacing between rows**: ~120px

---

## Edge Waypoint Rules

Waypoints define the connector lines. Calculate them precisely:

1. Start from the **center** of the source shape:
   \`(source.x + source.width/2, source.y + source.height/2)\`
2. End at the **center** of the target shape:
   \`(target.x + target.width/2, target.y + target.height/2)\`
3. For branching (gateway to multiple targets), draw horizontal lines from the gateway center, then vertical drops.
4. Use intermediate waypoints for L-shaped or Z-shaped connectors.

---

## Critical Checklist

Before outputting the XML, verify:

- Every \`bpmn:process\` element has a matching \`bpmndi:BPMNShape\`
- Every \`bpmn:sequenceFlow\` has a matching \`bpmndi:BPMNEdge\`
- All \`id\` attributes are unique across the entire document
- \`bpmnElement\` in DI matches the process element ID **exactly**
- \`sourceRef\` / \`targetRef\` in flows match existing element IDs
- Gateway shapes include \`isMarkerVisible="true"\`
- Waypoints create visually logical connector paths (no crossing through shapes)

---

## Output Format

Return **ONLY** the raw XML — no markdown fences, no explanations, no code blocks. Start directly with \`<?xml\` or \`<bpmn:definitions\`.`;

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
