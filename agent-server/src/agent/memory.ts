import { storeOnFilecoin } from "../services/storage.js";
import { updateDataCID } from "../services/identity.js";
import { activityLog } from "./activity.js";
import { config } from "../config.js";

export interface MemoryEntry {
  type: "analyze" | "generate" | "predict";
  query: string;
  response: unknown;
  timestamp: string;
}

export interface MemoryBatch {
  batchId: number;
  cid: string;
  entryCount: number;
  flushedAt: string;
}

class AgentMemory {
  private buffer: MemoryEntry[] = [];
  private readonly FLUSH_THRESHOLD = 10;
  private memoryIndex: MemoryBatch[] = [];
  private indexCID: string = "";
  private batchCounter = 0;
  private flushing = false;

  addEntry(entry: Omit<MemoryEntry, "timestamp">): void {
    this.buffer.push({ ...entry, timestamp: new Date().toISOString() });

    if (this.buffer.length >= this.FLUSH_THRESHOLD && !this.flushing) {
      this.flush().catch((err) => console.error("[Memory] Flush error:", err));
    }
  }

  async flush(): Promise<string | null> {
    if (this.buffer.length === 0) return null;
    if (this.flushing) return null;

    this.flushing = true;
    try {
      const batch = [...this.buffer];
      this.buffer = [];
      this.batchCounter++;

      const batchName = `memory-batch-${this.batchCounter}-${Date.now()}`;
      const batchCID = await storeOnFilecoin(
        { entries: batch, batchId: this.batchCounter },
        batchName,
      );

      this.memoryIndex.push({
        batchId: this.batchCounter,
        cid: batchCID,
        entryCount: batch.length,
        flushedAt: new Date().toISOString(),
      });

      const indexCID = await storeOnFilecoin(
        { agent: config.AGENT_NAME, batches: this.memoryIndex },
        `memory-index-${Date.now()}`,
      );
      this.indexCID = indexCID;

      try {
        await updateDataCID(indexCID);
      } catch (err) {
        console.warn("[Memory] On-chain CID update failed (non-fatal):", err);
      }

      console.log(
        `[Memory] Flushed ${batch.length} entries → batch CID: ${batchCID}, index CID: ${indexCID}`,
      );
      activityLog.add("storage", "Memory flushed to Filecoin", `Batch ${this.batchCounter}: ${batch.length} entries, CID: ${batchCID}`);
      return batchCID;
    } finally {
      this.flushing = false;
    }
  }

  getBuffer(): MemoryEntry[] {
    return [...this.buffer];
  }

  getIndex(): MemoryBatch[] {
    return [...this.memoryIndex];
  }

  getIndexCID(): string {
    return this.indexCID;
  }

  count(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}

export const agentMemory = new AgentMemory();
