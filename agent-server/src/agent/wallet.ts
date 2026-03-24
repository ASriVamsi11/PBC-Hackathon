class AgentWallet {
  private totalEarningsUsd = 0;
  private totalRequests = 0;

  recordEarning(amountUsd: number): void {
    this.totalEarningsUsd += amountUsd;
    this.totalRequests += 1;
  }

  getStats(): { totalEarningsUsd: number; totalRequests: number } {
    return {
      totalEarningsUsd: this.totalEarningsUsd,
      totalRequests: this.totalRequests,
    };
  }
}

export const agentWallet = new AgentWallet();
