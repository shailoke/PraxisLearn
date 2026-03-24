import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic, lesson_content, user_question } = await req.json();

    if (!topic || !user_question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a friendly English teacher helping an 11-year-old student.

Explain concepts in very simple language.
Use short sentences.
Use examples wherever helpful.

Rules:
- Keep answers between 3-6 lines
- Use simple words
- Stay within the topic
- Do not introduce advanced concepts
- If needed, give 2-3 examples

Be encouraging and clear.

Current Topic: ${topic}
Lesson Context: ${lesson_content}`
        },
        {
          role: "user",
          content: user_question
        }
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't think of an answer right now. Could you ask me again?";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Tutor API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
