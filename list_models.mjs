import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function run() {
  const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await models.json();
  console.log(data);
}
run();
