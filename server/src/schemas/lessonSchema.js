import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

/**
 * Lesson Schema for OpenAI Structured Outputs (strict mode).
 *
 * IMPORTANT: OpenAI strict mode requires every property in an object
 * to appear in `required`. This means we CANNOT use discriminatedUnion
 * for shapes (different shapes have different properties). Instead, we use
 * a single flat object where shape-specific fields are nullable.
 */

// --- Segment Types ---

const headingSegment = z.object({
  type: z.literal('heading'),
  content: z.object({
    text: z.string().describe("Heading text content")
  })
});

const textSegment = z.object({
  type: z.literal('text'),
  content: z.object({
    text: z.string().describe("Text paragraph content")
  })
});

const mathSegment = z.object({
  type: z.literal('math'),
  content: z.object({
    latex: z.string().describe("LaTeX math expression"),
    display: z.boolean().describe("Whether to render in display mode (centered/large)")
  })
});

/**
 * Flat shape schema — all properties present, shape-specific ones nullable.
 * The `shape` field determines which properties are semantically active.
 *
 * Usage by shape type:
 *   rect:    x, y, w, h, label, color, fill
 *   circle:  x, y, r, label, color, fill
 *   ellipse: x, y, w, h, label, color, fill
 *   line:    from, to, color
 *   arrow:   from, to, label, color
 *   polygon: points, color, fill
 *   arc:     x, y, w, h, startAngle, endAngle, color
 */
const shapeSchema = z.object({
  shape: z.enum(['rect', 'circle', 'ellipse', 'line', 'arrow', 'polygon', 'arc']),
  // Position (used by rect, circle, ellipse, arc)
  x: z.number().nullable().describe("X position for rect/circle/ellipse/arc"),
  y: z.number().nullable().describe("Y position for rect/circle/ellipse/arc"),
  // Dimensions (used by rect, ellipse, arc)
  w: z.number().nullable().describe("Width for rect/ellipse/arc"),
  h: z.number().nullable().describe("Height for rect/ellipse/arc"),
  // Radius (used by circle)
  r: z.number().nullable().describe("Radius for circle"),
  // Line endpoints (used by line, arrow)
  from: z.array(z.number()).nullable().describe("[x, y] start coordinates for line/arrow"),
  to: z.array(z.number()).nullable().describe("[x, y] end coordinates for line/arrow"),
  // Polygon vertices
  points: z.array(z.array(z.number())).nullable().describe("Array of [x, y] coordinates for polygon"),
  // Arc angles
  startAngle: z.number().nullable().describe("Start angle in radians for arc"),
  endAngle: z.number().nullable().describe("End angle in radians for arc"),
  // Common properties
  label: z.string().nullable().describe("Optional text label"),
  color: z.string().nullable().describe("Stroke color"),
  fill: z.string().nullable().describe("Fill color")
});

const diagramSegment = z.object({
  type: z.literal('diagram'),
  content: z.object({
    elements: z.array(shapeSchema).describe("List of shape elements to render")
  })
});

const graphSegment = z.object({
  type: z.literal('graph'),
  content: z.object({
    chartType: z.enum(['line', 'bar', 'scatter', 'area']),
    xLabel: z.string().nullable(),
    yLabel: z.string().nullable(),
    data: z.array(z.object({ x: z.number(), y: z.number() })).nullable(),
    func: z.string().nullable().describe("JS math function expression for coordinate plots")
  })
});

const networkSegment = z.object({
  type: z.literal('network'),
  content: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      label: z.string().nullable(),
      group: z.number().nullable(),
      color: z.string().nullable()
    })),
    edges: z.array(z.object({
      source: z.string(),
      target: z.string(),
      label: z.string().nullable()
    })),
    layout: z.enum(['force', 'layered']).nullable(),
    title: z.string().nullable()
  })
});

const tableSegment = z.object({
  type: z.literal('table'),
  content: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string()))
  })
});

const annotationSegment = z.object({
  type: z.literal('annotation'),
  content: z.object({
    annotationType: z.enum(['arrow', 'highlight', 'circle', 'bracket', 'label']),
    text: z.string().nullable(),
    x: z.number(),
    y: z.number(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    radius: z.number().nullable()
  })
});

const stepMarkerSegment = z.object({
  type: z.literal('step_marker'),
  content: z.object({
    text: z.string().describe("Step marker text (e.g. 'Step 1: Simplify')")
  })
});

const checkpointSegment = z.object({
  type: z.literal('checkpoint'),
  content: z.object({
    question: z.string().describe("Checkpoint question text"),
    options: z.array(z.string()).describe("Multiple choice options"),
    correctIndex: z.number().describe("Zero-indexed correct option"),
    explanation: z.string().describe("Explanation for the correct answer")
  })
});

const segmentSchema = z.discriminatedUnion('type', [
  headingSegment,
  textSegment,
  mathSegment,
  diagramSegment,
  graphSegment,
  networkSegment,
  tableSegment,
  annotationSegment,
  stepMarkerSegment,
  checkpointSegment
]);

export const lessonZodSchema = z.object({
  title: z.string().describe("A concise title for the lesson"),
  segments: z.array(segmentSchema).describe("Ordered array of visual segments to render on the whiteboard")
});

export const openaiResponseFormat = zodResponseFormat(lessonZodSchema, "lesson_schema");
