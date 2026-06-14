import dotenv from 'dotenv';
dotenv.config();

import { processDocument } from './src/agent/ingestionAgent.js';
import { evaluateChat } from './src/agent/criticAgent.js';
import { getDatabase, createProject, createDocument, createChatInDb, saveMessageToDb, getStudentProfile } from './src/db/database.js';

async function runTest() {
  getDatabase(); // initialize db tables
  
  console.log('--- Testing Ingestion Agent ---');
  const projectId = createProject(null, 'guest_test', 'Test Project');
  const docId = createDocument(projectId, 'test_bio_chapter.txt', 'processing');

  const rawText = `
Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy.
It occurs in the chloroplasts. The main stages are the light-dependent reactions and the Calvin cycle (light-independent reactions).
In the light-dependent reactions, chlorophyll absorbs energy from sunlight, producing ATP and NADPH.
In the Calvin cycle, the ATP and NADPH are used to convert CO2 into glucose.
  `;

  console.log(`Created Project ${projectId}, Document ${docId}. Running ingestion...`);
  await processDocument(docId, rawText);
  
  console.log('\n--- Testing Critic Agent ---');
  const chatId = createChatInDb(projectId, 'Photosynthesis Help');
  saveMessageToDb(chatId, 'ai', 'What are the two main stages of photosynthesis?');
  saveMessageToDb(chatId, 'user', 'I think one is the Calvin cycle, but I forgot the other one. Is it the Krebs cycle? I am so confused and lost...');
  
  console.log(`Created Chat ${chatId}. Running evaluation...`);
  await evaluateChat(chatId, null, 'guest_test', null);
  
  const profile = getStudentProfile(null, 'guest_test');
  console.log('Updated Profile:', profile);
  
  console.log('\nTests completed.');
  process.exit(0);
}

runTest().catch(console.error);
