export interface MemoryEntry {
  type: "analyze" | "generate" | "predict";
  query: string;
  response: unknown;
  timestamp: string;
}

class AgentMemory {
  private buffer: MemoryEntry[] = [];
  private readonly FLUSH_THRESHOLD = 10;

  addEntry(entry: Omit<MemoryEntry, "timestamp">): void {
    this.buffer.push({ ...entry, timestamp: new Date().toISOString() });

    if (this.buffer.length >= this.FLUSH_THRESHOLD) {
      // Phase 2 will wire this to Filecoin flush
      this.clear();
    }
  }

  getBuffer(): MemoryEntry[] {
    return [...this.buffer];
  }

  count(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}

export const agentMemory = new AgentMemory();
