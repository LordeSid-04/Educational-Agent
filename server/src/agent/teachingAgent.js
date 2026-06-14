import OpenAI from 'openai';
import { buildSystemPrompt, buildUserPrompt } from './promptBuilder.js';
import { openaiResponseFormat } from '../schemas/lessonSchema.js';
import { lessonCache } from '../middleware/cache.js';

/**
 * TeachingAgent — Orchestrates lesson generation via OpenAI.
 *
 * Features:
 *  - Structured output via Zod schema → JSON
 *  - Bloom's Taxonomy-aware prompt scaffolding
 *  - In-memory LRU cache for identical prompts
 *  - Conversation context threading
 */
export class TeachingAgent {
  constructor() {
    this._openai = null;
    this.model = 'gpt-4o'; // Best model for strict structured outputs
  }

  get openai() {
    if (!this._openai) {
      this._openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this._openai;
  }

  async generateLesson(prompt, options = {}) {
    const {
      conversationHistory = [],
      bloomLevel = 'understand',
    } = options;

    // Check cache first (only for identical prompts without prior conversation)
    if (conversationHistory.length === 0) {
      const cached = lessonCache.get(prompt, bloomLevel);
      if (cached) {
        console.log(`[Agent] Cache HIT for "${prompt.slice(0, 50)}..."`);
        return cached;
      }
    }

    const systemPrompt = buildSystemPrompt({
      bloomLevel,
      previousContext: conversationHistory.length > 0
        ? conversationHistory.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')
        : '',
    });

    const userPrompt = buildUserPrompt(prompt, conversationHistory);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: openaiResponseFormat,
        temperature: 0.7,
      });

      const messageContent = response.choices[0].message.content;
      if (!messageContent) {
        throw new Error('Empty response from OpenAI');
      }

      const lesson = JSON.parse(messageContent);

      // Cache the result
      if (conversationHistory.length === 0) {
        lessonCache.set(prompt, bloomLevel, lesson);
        console.log(`[Agent] Cached lesson for "${prompt.slice(0, 50)}..."`);
      }

      return lesson;
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Check your .env file.');
      }
      if (error.status === 429) {
        throw new Error('OpenAI rate limit reached. Please wait and try again.');
      }
      throw error;
    }
  }

  async continueAfterCheckpoint(checkpointResult, options = {}) {
    const {
      conversationHistory = [],
      bloomLevel = 'understand',
    } = options;

    const wasCorrect = checkpointResult.isCorrect;
    const wasSkipped = checkpointResult.skipped;

    let continuationPrompt;
    if (wasSkipped) {
      continuationPrompt = `The student skipped the checkpoint question about "${checkpointResult.question}". 
Continue the lesson from where we left off, briefly covering the key point they might have missed.`;
    } else if (wasCorrect) {
      continuationPrompt = `The student correctly answered the checkpoint question: "${checkpointResult.question}". 
They chose: "${checkpointResult.selectedAnswer}". 
Continue with the next topic, advancing to a slightly higher difficulty level.`;
    } else {
      continuationPrompt = `The student incorrectly answered the checkpoint question: "${checkpointResult.question}". 
They chose: "${checkpointResult.selectedAnswer}" but the correct answer was different.
Re-explain the concept using a different approach, analogy, or visual before moving on.`;
    }

    return this.generateLesson(continuationPrompt, {
      conversationHistory,
      bloomLevel,
    });
  }

  async clarify(topic, options = {}) {
    const clarifyPrompt = `The student asked for a different explanation of: "${topic}".
Explain this concept using a completely different analogy, approach, or visual style than before.
If you used text before, try more visuals. If you used math, try a real-world analogy.`;

    return this.generateLesson(clarifyPrompt, options);
  }
}
