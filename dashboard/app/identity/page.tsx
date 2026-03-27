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
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "32px" }}>
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
          <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--color-text)" }}>Identity</h1>
          <p className="label-section mt-1">On-chain agent identity & reputation</p>
        </div>
        <div className="text-center py-12" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Agent not registered on-chain
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-gold-dim)" }}>
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
        <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--color-text)" }}>Identity</h1>
        <p className="label-section mt-1">On-chain agent identity & reputation</p>
      </div>

      {/* Agent Name & Status */}
      <div className="card-accent animate-fade-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "28px" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="label-section mb-2">Agent Name</p>
            <h2 className="font-serif text-3xl font-semibold" style={{ color: "var(--color-text)" }}>
              {agent.name}
            </h2>
          </div>
          <div
            className="px-3 py-1.5 text-xs font-medium"
            style={{
              color: agent.isActive ? "var(--color-success)" : "var(--color-danger)",
              border: `1px solid ${agent.isActive ? "var(--color-success)" : "var(--color-danger)"}`,
              borderRadius: "3px",
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
      <div className="card-accent animate-fade-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "28px" }}>
        <p className="label-section mb-6">Reputation Score</p>

        <div className="space-y-6">
          {/* Score + Ring */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="num text-4xl font-semibold" style={{ color: "var(--color-text)" }}>
                  {agent.reputationScore}
                </span>
                <span className="num text-lg" style={{ color: "var(--color-text-muted)" }}>
                  / {maxReputation}
                </span>
              </div>
              <div
                className="inline-block px-3 py-1 text-xs font-semibold"
                style={{
                  background: "rgba(201,168,76,0.12)",
                  color: "var(--color-gold)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "3px",
                }}
              >
                {tier}
              </div>
            </div>

            {/* Circular Progress */}
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1A1A1A" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="#C9A84C"
                  strokeWidth="6"
                  strokeDasharray={`${(reputationPercentage / 100) * 339.29} 339.29`}
                  strokeLinecap="butt"
                  style={{ transition: "stroke-dasharray 0.5s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="num text-base font-semibold" style={{ color: "var(--color-gold)" }}>
                  {reputationPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-1.5 overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${reputationPercentage}%`, background: "var(--color-gold)" }}
              />
            </div>
            <div className="flex justify-between text-xs num" style={{ color: "var(--color-text-muted)" }}>
              <span>Bronze</span>
              <span>Silver</span>
              <span>Gold</span>
              <span>Diamond</span>
            </div>
          </div>

          {/* On-chain stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", padding: "16px" }}>
              <p className="label-section mb-1">Total Requests (on-chain)</p>
              <p className="num text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                {agent.totalRequests.toLocaleString()}
              </p>
            </div>
            <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", padding: "16px" }}>
              <p className="label-section mb-1">Total Earnings (on-chain)</p>
              <p className="num text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                {agent.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div className="card-accent animate-fade-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "24px" }}>
        <p className="label-section mb-4">Wallet Information</p>
        <div className="space-y-4">
          <div>
            <p className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>FEVM Wallet Address</p>
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <code className="num text-sm flex-1" style={{ color: "var(--color-gold)" }}>
                {agent.walletAddress}
              </code>
              <button
                className="text-xs px-2 py-1 transition-colors duration-150"
                style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                onClick={() => { navigator.clipboard.writeText(agent.walletAddress); toast("Copied to clipboard", "success"); }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.borderColor = "var(--color-gold)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Data CID</p>
            <div className="px-3 py-2" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <code className="num text-sm break-all" style={{ color: "var(--color-gold)" }}>
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
      <div className="card-accent animate-fade-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "24px" }}>
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
