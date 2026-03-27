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
