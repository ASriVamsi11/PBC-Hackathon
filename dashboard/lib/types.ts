export interface AgentStatus {
  agent: string;
  wallet: string;
  totalEarningsUsd: number;
  totalRequests: number;
  memoryCount: number;
  uptime: number;
}

export interface ActivityEvent {
  id: number;
  type: "earning" | "storage" | "reputation" | "system";
  title: string;
  description: string;
  timestamp: string;
}

export interface MemoryBatch {
  batchId: number;
  cid: string;
  entryCount: number;
  flushedAt: string;
}

export interface MemoriesResponse {
  agent: string;
  indexCID: string;
  totalBatches: number;
  batches: MemoryBatch[];
  currentBufferSize: number;
}

export interface OnChainAgent {
  walletAddress: string;
  name: string;
  dataCID: string;
  reputationScore: number;
  totalEarnings: number;
  totalRequests: number;
  registrationTime: number;
  isActive: boolean;
}

export interface IdentityResponse {
  agent: string;
  onChain?: OnChainAgent;
  status?: string;
  message?: string;
}

export interface PlaygroundResponse {
  result: Array<{ type: string; text?: string }>;
  agent: string;
}
