import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { createTopic, createNode, updateDocumentStatus } from '../db/database.js';
import { openaiResponseFormat as lessonFormat } from '../schemas/lessonSchema.js';

let openai = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

// The Curriculum Architect defines the structure of the document
const syllabusSchema = z.object({
  topics: z.array(z.object({
    title: z.string().describe("Main topic or chapter title"),
    nodes: z.array(z.object({
      title: z.string().describe("Sub-topic or concept title"),
      content_text: z.string().describe("A comprehensive, pedagogical summary of this specific sub-topic extracted from the document")
    })).describe("Concepts covered under this topic")
  })).describe("List of main topics extracted from the document")
});

const syllabusFormat = zodResponseFormat(syllabusSchema, "syllabus_schema");

export async function processDocument(documentId, rawText) {
  try {
    console.log(`[IngestionAgent] Starting processing for document ID: ${documentId}`);
    
    // Step 1: Curriculum Architect
    console.log(`[IngestionAgent] Architect phase: Extracting curriculum from raw text...`);
    const architectResponse = await getOpenAI().beta.chat.completions.parse({
      model: "gpt-5.5-2026-04-23",
      messages: [
        {
          role: "system",
          content: "You are the Curriculum Architect. Your job is to read raw study material, extract the core educational content, and organize it into a structured syllabus composed of Topics and Nodes. Each Node must contain a 'content_text' field which is a clear, pedagogical explanation of that specific concept, as if written for a textbook."
        },
        {
          role: "user",
          content: `Here is the raw text from the document:\n\n${rawText.substring(0, 100000)}` // Limit to ~100k chars for safety
        }
      ],
      response_format: syllabusFormat,
      temperature: 0.2
    });

    const syllabus = architectResponse.choices[0].message.parsed;
    console.log(`[IngestionAgent] Extracted ${syllabus.topics.length} topics.`);

    // Step 2: Assessment Writer (Generate visuals/quizzes for each node)
    let topicOrder = 0;
    for (const topic of syllabus.topics) {
      console.log(`[IngestionAgent] Processing Topic: ${topic.title}`);
      const topicId = createTopic(documentId, topic.title, topicOrder++);
      
      let nodeOrder = 0;
      for (const node of topic.nodes) {
        console.log(`  -> Processing Node: ${node.title}`);
        
        let segmentsJson = [];
        try {
          // The Assessment Writer takes the node text and generates visual/interactive segments
          const writerResponse = await getOpenAI().beta.chat.completions.parse({
            model: "gpt-5.5-2026-04-23",
            messages: [
              {
                role: "system",
                content: "You are the Assessment & Visuals Writer. Your task is to take a textbook concept and generate engaging visual segments (diagrams, math, checkpoints) to teach it. Output ONLY the structured segments. Ensure a mix of text, visual (diagram/graph), and a checkpoint question."
              },
              {
                role: "user",
                content: `Create visual segments for this concept: ${node.title}\n\nContent:\n${node.content_text}`
              }
            ],
            response_format: lessonFormat,
            temperature: 0.4
          });

          segmentsJson = writerResponse.choices[0].message.parsed.segments;
        } catch (writerErr) {
          console.error(`[IngestionAgent] Writer failed for node ${node.title}:`, writerErr.message);
          // Fallback to empty segments if writer fails
        }

        // Save node to DB
        createNode(topicId, node.title, node.content_text, segmentsJson, nodeOrder++);
      }
    }

    console.log(`[IngestionAgent] Completed processing for document ID: ${documentId}`);
    updateDocumentStatus(documentId, 'completed');

  } catch (err) {
    console.error(`[IngestionAgent] Error processing document ${documentId}:`, err);
    updateDocumentStatus(documentId, 'error');
  }
}
