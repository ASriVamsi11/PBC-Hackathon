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
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";

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
        borderColor: "#1A1A1A",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        fill: false,
        pointRadius: 2,
        pointBackgroundColor: "#1A1A1A",
        pointBorderColor: "#1A1A1A",
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
        labels: { color: "#9B9590", font: { size: 11, family: "Inter" } },
      },
      tooltip: {
        backgroundColor: "#1A1A1A",
        borderColor: "#E5E3DC",
        borderWidth: 1,
        titleColor: "#F5F4EF",
        bodyColor: "#F5F4EF",
        bodyFont: { family: "DM Mono" },
        cornerRadius: 4,
        boxShadow: "none",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#E5E3DC" },
        ticks: { color: "#9B9590", font: { size: 10, family: "Inter" } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9B9590", font: { size: 10, family: "Inter" }, maxTicksLimit: 10 },
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
          <div className="h-8 w-40 rounded animate-pulse bg-[var(--color-surface-2)]" />
          <div className="h-4 w-60 rounded animate-pulse mt-2 bg-[var(--color-surface-2)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonChart />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const agentName = status?.agent || "MintAI";
  const totalEarnings = status?.totalEarningsUsd || 0;
  const totalRequests = status?.totalRequests || 0;
  const walletAddress = status?.wallet || "N/A";
  const uptime = status?.uptime ? `${(status.uptime / 3600).toFixed(1)}h` : "0h";

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[var(--color-text)]">
            Overview
          </h1>
          <p className="label-section mt-1">{agentName}</p>
        </div>
        <Badge variant="success" className="mt-1 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
          Live
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earnings" value={`$${totalEarnings.toFixed(4)}`} sub="USDC via x402" />
        <StatCard label="Requests Served" value={totalRequests.toLocaleString()} sub="x402 micropayments" />
        <StatCard label="Memory Buffer" value={String(status?.memoryCount || 0)} sub="entries pending flush" />
        <StatCard label="Uptime" value={uptime} sub="since last restart" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <p className="label-section">Earnings Over Time</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Wallet */}
      <Card>
        <CardHeader className="pb-2">
          <p className="label-section">Wallet Information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs mb-1.5 text-[var(--color-text-muted)]">Wallet Address (Solana)</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
              <code className="num text-sm flex-1 text-[var(--color-accent)]">{walletAddress}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyAddress(walletAddress)}
              >
                Copy
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1 text-[var(--color-text-muted)]">Network</p>
              <p className="text-sm text-[var(--color-text)]">Solana Devnet</p>
            </div>
            <div>
              <p className="text-xs mb-1 text-[var(--color-text-muted)]">Token</p>
              <p className="text-sm text-[var(--color-text)]">USDC</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="label-section">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="num font-serif text-[var(--color-text)]" style={{ fontSize: "1.75rem", fontWeight: 500 }}>
          {value}
        </p>
        <p className="text-xs mt-1.5 text-[var(--color-text-muted)]">{sub}</p>
      </CardContent>
    </Card>
  );
}
