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
      <div className="p-8 space-y-6">
        <div>
          <div className="h-8 w-32 rounded animate-pulse" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 w-56 rounded animate-pulse mt-2" style={{ background: "var(--color-surface-2)" }} />
        </div>
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "32px" }}>
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  if (!data?.onChain) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl" style={{ color: "var(--color-text)", fontWeight: 400 }}>Identity</h1>
          <p className="label-section mt-1">On-chain agent identity & reputation</p>
        </div>
        <div
          className="text-center py-12"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Agent not registered on-chain
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-neutral)" }}>
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
    if (score >= 900) return "Diamond";
    if (score >= 700) return "Platinum";
    if (score >= 500) return "Gold";
    if (score >= 300) return "Silver";
    return "Bronze";
  };

  const tier = getReputationTier(agent.reputationScore);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl" style={{ color: "var(--color-text)", fontWeight: 400 }}>Identity</h1>
        <p className="label-section mt-1">On-chain agent identity & reputation</p>
      </div>

      {/* Agent Name & Status */}
      <div
        className="animate-fade-in"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "28px" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="label-section mb-2">Agent Name</p>
            <h2 className="font-serif text-3xl" style={{ color: "var(--color-text)", fontWeight: 400 }}>
              MintAI
            </h2>
          </div>
          <div
            className="px-3 py-1.5 text-xs"
            style={{
              color: agent.isActive ? "var(--color-success)" : "var(--color-danger)",
              border: `1px solid ${agent.isActive ? "var(--color-success)" : "var(--color-danger)"}`,
              borderRadius: "3px",
              fontFamily: "var(--font-sans)",
            }}
          >
            {agent.isActive ? "Active" : "Inactive"}
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Deployed on Filecoin Calibration testnet
        </p>
      </div>

      {/* Reputation */}
      <div
        className="animate-fade-in"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "28px" }}
      >
        <p className="label-section mb-6">Reputation Score</p>

        <div className="space-y-6">
          {/* Score + Ring */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="num font-serif" style={{ color: "var(--color-text)", fontSize: "2.5rem", fontWeight: 500 }}>
                  {agent.reputationScore}
                </span>
                <span className="num text-lg" style={{ color: "var(--color-text-muted)" }}>
                  / {maxReputation}
                </span>
              </div>
              <div
                className="inline-block px-3 py-1 text-xs"
                style={{
                  color: "var(--color-accent)",
                  border: "1px solid var(--color-border)",
                  borderLeft: "3px solid var(--color-accent)",
                  borderRadius: "3px",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {tier}
              </div>
            </div>

            {/* Circular Progress */}
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E3DC" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="#CC785C"
                  strokeWidth="6"
                  strokeDasharray={`${(reputationPercentage / 100) * 339.29} 339.29`}
                  strokeLinecap="butt"
                  style={{ transition: "stroke-dasharray 0.5s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="num text-base" style={{ color: "var(--color-accent)", fontWeight: 500 }}>
                  {reputationPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-1 overflow-hidden" style={{ background: "var(--color-border)" }}>
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${reputationPercentage}%`, background: "var(--color-accent)" }}
              />
            </div>
            <div className="flex justify-between" style={{ color: "var(--color-neutral)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.05em" }}>
              <span>Bronze</span>
              <span>Silver</span>
              <span>Gold</span>
              <span>Diamond</span>
            </div>
          </div>

          {/* On-chain stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "4px", padding: "16px" }}>
              <p className="label-section mb-2">Total Requests (on-chain)</p>
              <p className="num font-serif text-lg" style={{ color: "var(--color-text)", fontWeight: 500 }}>
                {agent.totalRequests.toLocaleString()}
              </p>
            </div>
            <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "4px", padding: "16px" }}>
              <p className="label-section mb-2">Total Earnings (on-chain)</p>
              <p className="num font-serif text-lg" style={{ color: "var(--color-text)", fontWeight: 500 }}>
                {agent.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div
        className="animate-fade-in"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "24px" }}
      >
        <p className="label-section mb-4">Wallet Information</p>
        <div className="space-y-4">
          <div>
            <p className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>FEVM Wallet Address</p>
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "4px" }}
            >
              <code className="num text-sm flex-1" style={{ color: "var(--color-accent)" }}>
                {agent.walletAddress}
              </code>
              <button
                className="text-xs px-2 py-1 transition-opacity duration-150"
                style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: "3px" }}
                onClick={() => { navigator.clipboard.writeText(agent.walletAddress); toast("Copied to clipboard", "success"); }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Data CID</p>
            <div
              className="px-3 py-2"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "4px" }}
            >
              <code className="num text-sm break-all" style={{ color: "var(--color-accent)" }}>
                {agent.dataCID || "None"}
              </code>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Chain</p>
              <p className="text-sm" style={{ color: "var(--color-text)" }}>Filecoin Calibration</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Network Status</p>
              <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--color-text)" }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--color-success)" }} />
                Synced
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration */}
      <div
        className="animate-fade-in"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "24px" }}
      >
        <p className="label-section mb-4">Registration Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Registration Time</p>
            <p className="num" style={{ color: "var(--color-text)" }}>{registrationDate}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Current Status</p>
            <p style={{ color: agent.isActive ? "var(--color-success)" : "var(--color-danger)" }}>
              {agent.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
