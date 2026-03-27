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

  const textColor = "#d4d4d8";
  const gridColor = "rgba(228, 228, 231, 0.1)";

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

  // If no events, show a single point at 0
  const labels = chartPoints.length > 0 ? chartPoints.map((p) => p.time) : ["Now"];
  const dataValues = chartPoints.length > 0 ? chartPoints.map((p) => p.value) : [0];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cumulative Earnings (USDC)",
        data: dataValues,
        borderColor: "rgb(6, 182, 212)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderWidth: 2,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: "rgb(6, 182, 212)",
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: textColor, font: { size: 12 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11 }, maxTicksLimit: 10 },
      },
    },
  };

  const StatCard = ({
    label,
    value,
    subtext,
  }: {
    label: string;
    value: string | number;
    subtext?: string;
  }) => (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtext && <p className="text-zinc-500 text-xs mt-2">{subtext}</p>}
    </div>
  );

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast("Copied to clipboard!", "success");
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 w-40 bg-zinc-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-60 bg-zinc-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-zinc-400 text-sm">Agent: {agentName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Earnings" value={`$${totalEarnings.toFixed(4)}`} subtext="USDC via x402" />
        <StatCard label="Requests Served" value={totalRequests.toLocaleString()} subtext="x402 micropayments" />
        <StatCard label="Memory Buffer" value={status?.memoryCount || 0} subtext="entries pending flush" />
        <StatCard label="Uptime" value={uptime} subtext="since last restart" />
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-white mb-6">Earnings Over Time</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-white mb-4">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-zinc-400 text-sm mb-1">Wallet Address (Solana)</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded px-3 py-2">
              <code className="text-cyan-400 text-sm font-mono">{walletAddress}</code>
              <button
                className="ml-auto text-zinc-400 hover:text-white text-xs"
                onClick={() => copyAddress(walletAddress)}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Network</p>
              <p className="text-white font-medium">Solana Devnet</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-2">Token</p>
              <p className="text-white font-medium">USDC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
