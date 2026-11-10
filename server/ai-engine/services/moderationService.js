import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callAIChat } from './ollamaClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Rules file load
const rulesPath = path.join(__dirname, '../rules/rules.txt');

let SYSTEM_PROMPT = '';
let OUTPUT_SCHEMA = null;

try {
  SYSTEM_PROMPT = fs.readFileSync(rulesPath, 'utf-8');
  
  // 2. extracting schema
  const schemaMatch = SYSTEM_PROMPT.match(/SCHEMA_START\s*([\s\S]*?)\s*SCHEMA_END/);
  
  if (schemaMatch && schemaMatch[1]) {
    OUTPUT_SCHEMA = JSON.parse(schemaMatch[1]);
  } else {
    console.warn('⚠️ Warning: SCHEMA_START / SCHEMA_END not found in rules.txt. Using default schema.');
    // Fallback Schema 
    OUTPUT_SCHEMA = {
      "type": "object",
      "properties": {
        "isComplaint": { "type": "boolean" },
        "category": { 
          "type": "string",
          "enum": ["Mess Food Quality", "Hostel Infrastructure", "Academics", "Faculty Behaviour", "Ragging/Harassment", "Other", "self", "None"]
        }
      },
      "required": ["isComplaint", "category"],
      "additionalProperties": false
    };
  }
} catch (error) {
  console.error('❌ Error loading rules.txt:', error.message);
  throw new Error('Failed to load AI rulebook');
}

/**
 * Analyze a complaint using the AI rulebook.
 * @param {string} title 
 * @param {string} description 
 * @returns {object} Parsed JSON { isComplaint, category }
 */
export const analyzeComplaint = async (title, description) => {
  try {
    // Sirf user ka input prompt mein jayega, rulebook nahi
    const userPrompt = `Title: ${title}\nDescription: ${description}`;
    
    // AI ko call karein
    const result = await callAIChat(SYSTEM_PROMPT, userPrompt, OUTPUT_SCHEMA);
    
    // AI ke output ko validate karein (Safety Check)
    if (typeof result.isComplaint !== 'boolean') {
      throw new Error('AI returned invalid data structure');
    }

    return result;
  } catch (error) {
    console.error('❌ Moderation Service Error:', error.message);
    throw error; // Controller isko catch karke fallback use karega
  }
};