import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-20250514";

export async function analyze(query: string): Promise<Anthropic.ContentBlock[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: `Analyze the following and provide key insights: ${query}` }],
  });
  return response.content;
}

export async function generate(prompt: string): Promise<Anthropic.ContentBlock[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: `Generate content for: ${prompt}` }],
  });
  return response.content;
}

export async function predict(topic: string): Promise<Anthropic.ContentBlock[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: `Provide a market prediction and trend analysis for: ${topic}` }],
  });
  return response.content;
}

export async function chat(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
) {
  const systemPrompt = `You are PersistAgent-Alpha, an autonomous AI agent that earns revenue through x402 micropayments on Solana. You have three capabilities:
1. Analyze - data analysis and insights ($0.01 per request in production)
2. Generate - content generation ($0.005 per request in production)
3. Predict - market predictions and trends ($0.02 per request in production)

Respond helpfully. Keep responses concise but insightful. When the user's request maps to one of your capabilities, mention which one you're using.`;

  return anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ],
  });
}
