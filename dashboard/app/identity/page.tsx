"use client";

import { getIdentity } from "../../lib/api";
import { usePolling } from "../../lib/usePolling";
import { useToast } from "../components/Toast";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import type { IdentityResponse } from "../../lib/types";

export default function IdentityPage() {
  const { data, loading, error, refetch } = usePolling<IdentityResponse>(getIdentity, 10000);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 w-32 bg-zinc-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-zinc-700 rounded animate-pulse" />
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
          <Skeleton className="h-6 w-40 mb-8" />
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-12 w-24 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  if (!data?.onChain) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Identity</h1>
          <p className="text-zinc-400 text-sm">On-chain agent identity & reputation</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <p className="text-zinc-400 text-lg mb-2">Agent not registered on-chain</p>
          <p className="text-zinc-500 text-sm">
            {data?.message || "Start the agent server to trigger on-chain registration during boot."}
          </p>
        </div>
      </div>
    );
  }

  const agent = data.onChain;
  const maxReputation = 1000;
  const reputationPercentage = (agent.reputationScore / maxReputation) * 100;
  const registrationDate = agent.registrationTime > 0
    ? new Date(agent.registrationTime * 1000).toLocaleString()
    : "Unknown";

  const getReputationTier = (score: number) => {
    if (score >= 900) return { name: "Diamond", color: "from-cyan-500 to-blue-500" };
    if (score >= 700) return { name: "Platinum", color: "from-blue-500 to-purple-500" };
    if (score >= 500) return { name: "Gold", color: "from-yellow-500 to-orange-500" };
    if (score >= 300) return { name: "Silver", color: "from-gray-400 to-gray-500" };
    return { name: "Bronze", color: "from-amber-700 to-amber-800" };
  };

  const tier = getReputationTier(agent.reputationScore);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Identity</h1>
        <p className="text-zinc-400 text-sm">On-chain agent identity & reputation</p>
      </div>

      {/* Agent Name & Status */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 animate-fade-in-up">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-2">Agent Name</p>
            <h2 className="text-4xl font-bold text-white">
              {agent.name}
            </h2>
          </div>
          <div className="text-right">
            <div className={`inline-block ${agent.isActive ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"} border rounded-full px-4 py-2`}>
              <p className={`${agent.isActive ? "text-green-400" : "text-red-400"} font-medium text-sm`}>
                {agent.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
        <p className="text-zinc-400 text-sm">
          Deployed on Filecoin Calibration testnet
        </p>
      </div>

      {/* Reputation Gauge */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-8">Reputation Score</h2>

        <div className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white">
                  {agent.reputationScore}
                </span>
                <span className="text-zinc-400 text-lg">
                  / {maxReputation}
                </span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${tier.color} text-white`}>
                {tier.name}
              </div>
            </div>

            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(reputationPercentage / 100) * 339.29} 339.29`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.6s ease-out" }}
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
              <p className="text-zinc-400 text-xs mb-1">Total Requests (on-chain)</p>
              <p className="text-white text-lg font-bold">
                {agent.totalRequests.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <p className="text-zinc-400 text-xs mb-1">Total Earnings (on-chain)</p>
              <p className="text-white text-lg font-bold">
                {agent.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-white mb-4">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-zinc-400 text-sm mb-2">FEVM Wallet Address</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded px-4 py-3">
              <code className="text-cyan-400 text-sm font-mono flex-1">
                {agent.walletAddress}
              </code>
              <button
                className="text-zinc-400 hover:text-white text-xs font-medium"
                onClick={() => { navigator.clipboard.writeText(agent.walletAddress); toast("Copied to clipboard!", "success"); }}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p className="text-zinc-400 text-sm mb-2">Data CID</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded px-4 py-3">
              <code className="text-cyan-400 text-sm font-mono flex-1 break-all">
                {agent.dataCID || "None"}
              </code>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Chain</p>
              <p className="text-white font-medium">Filecoin Calibration testnet</p>
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
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-white mb-4">Registration Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-zinc-400 mb-1">Registration Time</p>
            <p className="text-white font-medium">{registrationDate}</p>
          </div>
          <div>
            <p className="text-zinc-400 mb-1">Current Status</p>
            <p className="text-white font-medium">{agent.isActive ? "Active" : "Inactive"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
