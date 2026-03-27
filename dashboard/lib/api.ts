const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:4021";

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
