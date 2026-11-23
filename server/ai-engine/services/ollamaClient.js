import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_CHAT_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
const MODEL_NAME = process.env.AI_MODEL_NAME || 'gemma4:e2b';
const TIMEOUT = parseInt(process.env.AI_TIMEOUT_MS) || 30000;
const NUM_CTX = parseInt(process.env.AI_NUM_CTX) || 2048;

const THINK = process.env.AI_THINK === 'false'; 

export const callAIChat = async (systemPrompt, userPrompt, schema = null) => {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt } 
    ];

    const payload = {
      model: MODEL_NAME,
      messages: messages,
      stream: false,
      think: THINK, 
      keep_alive: '30m',
      options: {
        temperature: 0,
        num_ctx: NUM_CTX
      }
    };

    if (schema) payload.format = schema;

    console.log(` AI Chat Request Sent to ${MODEL_NAME}...`);
    const startTime = Date.now();

    const response = await axios.post(OLLAMA_CHAT_URL, payload, { timeout: TIMEOUT });
    
    const endTime = Date.now();
    console.log(`✅ AI Response Received in ${(endTime - startTime) / 1000}s`);

    let aiText = response.data.message.content;

    if (schema) {
      try {
        const cleanJsonStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJsonStr);
      } catch (parseError) {
        console.error(' AI JSON Parse Error:', parseError.message);
        throw new Error('AI_INVALID_JSON');
      }
    }

    return aiText;
  } catch (error) {
    console.error('AI Core Engine Error:', error.message);
    throw new Error('AI_SERVICE_UNAVAILABLE');
  }
};