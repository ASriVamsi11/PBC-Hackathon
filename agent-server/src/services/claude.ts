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
