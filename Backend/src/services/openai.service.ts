import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const VISION_MODEL = 'gpt-4o-mini';
const CHAT_MODEL = 'gpt-4o-mini';

const CAPTION_PROMPT =
  'Describe this image clearly and helpfully for a curious user who wants to understand what they are looking at. Be concise but informative. Use plain text only — no markdown, bullet symbols, asterisks, or headings.';

export async function generateCaption(imageUrl: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: CAPTION_PROMPT },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const caption = response.choices[0]?.message?.content?.trim();

  if (!caption) {
    throw new Error('OpenAI returned an empty caption');
  }

  return caption;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function answerAboutImage(
  imageUrl: string,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'You are helping a user learn about this image. Answer follow-up questions based on what you see. Use plain text only — no markdown, asterisks, or bullet lists.',
        },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    },
    {
      role: 'assistant',
      content: 'I can see the image and I am ready to answer your questions about it.',
    },
    ...history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 800,
    messages,
  });

  const reply = response.choices[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('OpenAI returned an empty reply');
  }

  return reply;
}

export { VISION_MODEL as defaultVisionModel };
