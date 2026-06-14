import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { updateStudentProfile, getMessagesForChat } from '../db/database.js';

let openai = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const evaluationSchema = z.object({
  competency_level: z.number().int().min(1).max(5).describe("Bloom's Taxonomy Level (1: Remember, 2: Understand, 3: Apply, 4: Analyze, 5: Evaluate)"),
  frustration_index: z.number().min(0).max(1).describe("Estimated user frustration from 0.0 (calm) to 1.0 (highly frustrated/confused)"),
  reasoning: z.string().describe("Brief explanation for the score")
});

const evaluationFormat = zodResponseFormat(evaluationSchema, "evaluation_schema");

export async function evaluateChat(chatId, userId, guestId, topicId = null) {
  try {
    console.log(`[CriticAgent] Evaluating chat ID: ${chatId}`);
    
    const messages = getMessagesForChat(chatId);
    if (messages.length < 2) {
      console.log(`[CriticAgent] Not enough messages to evaluate.`);
      return;
    }

    // Format transcript for the prompt
    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const evalResponse = await getOpenAI().beta.chat.completions.parse({
      model: "gpt-4o-mini", // Use mini for fast/cheap async background eval
      messages: [
        {
          role: "system",
          content: "You are the Critic Agent. Your job is to analyze a conversation transcript between an AI tutor and a student. You must evaluate the student's current Competency Level (Bloom's Taxonomy 1-5) and their Frustration Index (0.0 to 1.0) based on their responses, tone, and accuracy in answering questions."
        },
        {
          role: "user",
          content: `Transcript:\n\n${transcript}`
        }
      ],
      response_format: evaluationFormat,
      temperature: 0.1
    });

    const parsed = evalResponse.choices[0].message.parsed;
    console.log(`[CriticAgent] Eval for chat ${chatId} - Competency: ${parsed.competency_level}, Frustration: ${parsed.frustration_index} (${parsed.reasoning})`);

    // Update profile
    updateStudentProfile(userId, guestId, topicId, parsed.competency_level, parsed.frustration_index);

  } catch (err) {
    console.error(`[CriticAgent] Error evaluating chat ${chatId}:`, err);
  }
}
