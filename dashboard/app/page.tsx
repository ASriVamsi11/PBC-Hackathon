"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { usePolling } from "../lib/usePolling";
import { getStatus, getActivity } from "../lib/api";
import { useToast } from "./components/Toast";
import { SkeletonCard, SkeletonChart } from "./components/Skeleton";
import { ErrorState } from "./components/ErrorState";
import type { AgentStatus, ActivityEvent } from "../lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Overview() {
  const { data: status, loading, error, refetch } = usePolling<AgentStatus>(getStatus, 10000);
  const { data: events } = usePolling<ActivityEvent[]>(getActivity, 10000);
  const { toast } = useToast();

  // Build cumulative earnings chart from real activity data
  const earningEvents = (events || []).filter((e) => e.type === "earning");
  let cumulative = 0;
  const chartPoints = earningEvents.map((e) => {
    const match = e.title.match(/\$([0-9.]+)/);
    cumulative += match ? parseFloat(match[1]) : 0;
    return {
      time: new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: cumulative,
    };
  });

  const labels = chartPoints.length > 0 ? chartPoints.map((p) => p.time) : ["Now"];
  const dataValues = chartPoints.length > 0 ? chartPoints.map((p) => p.value) : [0];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cumulative Earnings (USDC)",
        data: dataValues,
        borderColor: "#C9A84C",
        backgroundColor: "rgba(201, 168, 76, 0.08)",
        borderWidth: 1.5,
        fill: true,
        pointRadius: 2,
        pointBackgroundColor: "#C9A84C",
        pointBorderColor: "#C9A84C",
        pointBorderWidth: 0,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#8A8070", font: { size: 11, family: "DM Mono" } },
      },
      tooltip: {
        backgroundColor: "#1A1A1A",
        borderColor: "#2A2200",
        borderWidth: 1,
        titleColor: "#F0EAD6",
        bodyColor: "#C9A84C",
        bodyFont: { family: "DM Mono" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#1E1E1E" },
        ticks: { color: "#8A8070", font: { size: 10, family: "DM Mono" } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#8A8070", font: { size: 10, family: "DM Mono" }, maxTicksLimit: 10 },
      },
    },
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast("Copied to clipboard", "success");
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 w-40 rounded animate-pulse" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 w-60 rounded animate-pulse mt-2" style={{ background: "var(--color-surface-2)" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonChart />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const agentName = status?.agent || "PersistAgent-Alpha";
  const totalEarnings = status?.totalEarningsUsd || 0;
  const totalRequests = status?.totalRequests || 0;
  const walletAddress = status?.wallet || "N/A";
  const uptime = status?.uptime ? `${(status.uptime / 3600).toFixed(1)}h` : "0h";

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          Overview
        </h1>
        <p className="label-section mt-1">{agentName}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earnings" value={`$${totalEarnings.toFixed(4)}`} sub="USDC via x402" />
        <StatCard label="Requests Served" value={totalRequests.toLocaleString()} sub="x402 micropayments" />
        <StatCard label="Memory Buffer" value={String(status?.memoryCount || 0)} sub="entries pending flush" />
        <StatCard label="Uptime" value={uptime} sub="since last restart" />
      </div>

      {/* Chart */}
      <div className="card-accent animate-fade-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "24px" }}>
        <p className="label-section mb-4">Earnings Over Time</p>
        <div className="h-72">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Wallet */}
      <div className="card-accent animate-fade-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "24px" }}>
        <p className="label-section mb-4">Wallet Information</p>
        <div className="space-y-4">
          <div>
            <p className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Wallet Address (Solana)</p>
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <code className="num text-sm flex-1" style={{ color: "var(--color-gold)" }}>{walletAddress}</code>
              <button
                className="text-xs px-2 py-1 transition-colors duration-150"
                style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                onClick={() => copyAddress(walletAddress)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-gold)";
                  e.currentTarget.style.borderColor = "var(--color-gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-text-muted)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Network</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Solana Devnet</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Token</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>USDC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      className="card-accent animate-fade-in"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "20px" }}
    >
      <p className="label-section mb-2">{label}</p>
      <p className="num text-xl font-semibold" style={{ color: "var(--color-text)" }}>{value}</p>
      <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>{sub}</p>
    </div>
  );
}
