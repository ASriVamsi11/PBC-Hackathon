"use client";

import { useState, useEffect } from "react";
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
} from "chart.js";
import { getStatus } from "../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AgentStatus {
  agent: string;
  wallet: string;
  totalEarningsUsd: number;
  totalRequests: number;
  memoryCount: number;
  uptime: number;
}

export default function Overview() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatus()
      .then(setStatus)
      .catch((err) => console.error("Failed to fetch status:", err))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      getStatus().then(setStatus).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Dark mode colors
  const textColor = "#d4d4d8";
  const gridColor = "rgba(228, 228, 231, 0.1)";
  const pointBorderColor = "#fff";

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Earnings (USDC)",
        data: [0, 0, 0, 0, 0, 0, status?.totalEarningsUsd || 0],
        borderColor: "rgb(6, 182, 212)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderWidth: 2,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "rgb(6, 182, 212)",
        pointBorderColor: pointBorderColor,
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
        labels: {
          color: textColor,
          font: { size: 12 },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
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
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtext && <p className="text-zinc-500 text-xs mt-2">{subtext}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <p className="text-zinc-400 text-lg">Loading agent status...</p>
      </div>
    );
  }

  const agentName = status?.agent || "PersistAgent-Alpha";
  const totalEarnings = status?.totalEarningsUsd || 0;
  const totalRequests = status?.totalRequests || 0;
  const walletAddress = status?.wallet || "N/A";
  const uptime = status?.uptime ? `${(status.uptime / 3600).toFixed(1)}h` : "0h";

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-zinc-400 text-sm">
          Agent: {agentName}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Earnings" value={`$${totalEarnings.toFixed(4)}`} subtext="USDC via x402" />
        <StatCard
          label="Requests Served"
          value={totalRequests.toLocaleString()}
          subtext="x402 micropayments"
        />
        <StatCard
          label="Memory Buffer"
          value={status?.memoryCount || 0}
          subtext="entries pending flush"
        />
        <StatCard
          label="Uptime"
          value={uptime}
          subtext="since last restart"
        />
      </div>

      {/* Earnings Chart */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Weekly Earnings</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-zinc-400 text-sm mb-1">Wallet Address (Solana)</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded px-3 py-2">
              <code className="text-cyan-400 text-sm font-mono">
                {walletAddress}
              </code>
              <button
                className="ml-auto text-zinc-400 hover:text-white text-xs"
                onClick={() => navigator.clipboard.writeText(walletAddress)}
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
