"use client";

export default function IdentityPage() {
  const mockIdentity = {
    agentName: "PersistAgent-Alpha",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42e3b",
    reputationScore: 502,
    maxReputation: 1000,
    registrationTime: "2025-01-15 08:32:00",
    status: "Active",
    deploymentChain: "Filecoin Calibration testnet",
    creationBlock: 19347821,
    verifiedRequests: 15847,
    failureRate: 0.12,
  };

  const reputationPercentage =
    (mockIdentity.reputationScore / mockIdentity.maxReputation) * 100;

  // Determine reputation tier
  const getReputationTier = (score: number) => {
    if (score >= 900) return { name: "Diamond", color: "from-cyan-500 to-blue-500" };
    if (score >= 700) return { name: "Platinum", color: "from-blue-500 to-purple-500" };
    if (score >= 500) return { name: "Gold", color: "from-yellow-500 to-orange-500" };
    if (score >= 300) return { name: "Silver", color: "from-gray-400 to-gray-500" };
    return { name: "Bronze", color: "from-amber-700 to-amber-800" };
  };

  const tier = getReputationTier(mockIdentity.reputationScore);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Identity</h1>
        <p className="text-zinc-400 text-sm">On-chain agent identity & reputation</p>
      </div>

      {/* Agent Name & Status */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-2">Agent Name</p>
            <h2 className="text-4xl font-bold text-white">
              {mockIdentity.agentName}
            </h2>
          </div>
          <div className="text-right">
            <div className="inline-block bg-green-500/20 border border-green-500/50 rounded-full px-4 py-2">
              <p className="text-green-400 font-medium text-sm">
                {mockIdentity.status}
              </p>
            </div>
          </div>
        </div>
        <p className="text-zinc-400 text-sm">
          Deployed on {mockIdentity.deploymentChain} • Block{" "}
          {mockIdentity.creationBlock.toLocaleString()}
        </p>
      </div>

      {/* Reputation Gauge */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-8">Reputation Score</h2>

        <div className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white">
                  {mockIdentity.reputationScore}
                </span>
                <span className="text-zinc-400 text-lg">
                  / {mockIdentity.maxReputation}
                </span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${tier.color} text-white`}>
                {tier.name}
              </div>
            </div>

            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(reputationPercentage / 100) * 339.29} 339.29`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {reputationPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                style={{ width: `${reputationPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Bronze (300)</span>
              <span>Silver (500)</span>
              <span>Gold (700)</span>
              <span>Diamond (900)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-zinc-900 rounded-lg p-4">
              <p className="text-zinc-400 text-xs mb-1">Verified Requests</p>
              <p className="text-white text-lg font-bold">
                {mockIdentity.verifiedRequests.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <p className="text-zinc-400 text-xs mb-1">Failure Rate</p>
              <p className="text-white text-lg font-bold">
                {(mockIdentity.failureRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-zinc-400 text-sm mb-2">Wallet Address</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded px-4 py-3">
              <code className="text-cyan-400 text-sm font-mono flex-1">
                {mockIdentity.walletAddress}
              </code>
              <button className="text-zinc-400 hover:text-white text-xs font-medium">
                Copy
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Chain</p>
              <p className="text-white font-medium">{mockIdentity.deploymentChain}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-2">Network Status</p>
              <p className="text-white font-medium">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Synced
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Info */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Registration Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-zinc-400 mb-1">Registration Time</p>
            <p className="text-white font-medium">{mockIdentity.registrationTime}</p>
          </div>
          <div>
            <p className="text-zinc-400 mb-1">Creation Block</p>
            <p className="text-white font-mono font-medium">
              {mockIdentity.creationBlock.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 mb-1">Current Status</p>
            <p className="text-gray-900 dark:text-white font-medium">{mockIdentity.status}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-zinc-400 mb-1">Uptime</p>
            <p className="text-gray-900 dark:text-white font-medium">99.97%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
