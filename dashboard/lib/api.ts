export const AGENT_URL = (process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:4021").replace(/\/+$/, "");

export async function getStatus() {
  const res = await fetch(`${AGENT_URL}/api/status`);
  if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
  return res.json();
}

export async function getMemories() {
  const res = await fetch(`${AGENT_URL}/api/storage/memories`);
  if (!res.ok) throw new Error(`Memories fetch failed: ${res.status}`);
  return res.json();
}

export async function getIdentity() {
  const res = await fetch(`${AGENT_URL}/api/storage/identity`);
  if (!res.ok) throw new Error(`Identity fetch failed: ${res.status}`);
  return res.json();
}

export async function getActivity() {
  const res = await fetch(`${AGENT_URL}/api/activity`);
  if (!res.ok) throw new Error(`Activity fetch failed: ${res.status}`);
  return res.json();
}

export async function callAnalyze(query: string) {
  const res = await fetch(`${AGENT_URL}/api/playground/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
  return res.json();
}

export async function callGenerate(prompt: string) {
  const res = await fetch(`${AGENT_URL}/api/playground/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
  return res.json();
}

export async function callPredict(topic: string) {
  const res = await fetch(`${AGENT_URL}/api/playground/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) throw new Error(`Predict failed: ${res.status}`);
  return res.json();
}

export async function chatStream(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  const res = await fetch(`${AGENT_URL}/api/playground/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const data = JSON.parse(line.slice(6));
      if (data.type === "text") onChunk(data.text);
      else if (data.type === "done") onDone();
      else if (data.type === "error") onError(data.error);
    }
  }
}

export async function flushMemory() {
  const res = await fetch(`${AGENT_URL}/api/storage/flush`, { method: "POST" });
  if (!res.ok) throw new Error(`Flush failed: ${res.status}`);
  return res.json();
}

export async function getMemoryByCid(cid: string) {
  const res = await fetch(`${AGENT_URL}/api/storage/memory/${cid}`);
  if (!res.ok) throw new Error(`Memory fetch failed: ${res.status}`);
  return res.json();
}
