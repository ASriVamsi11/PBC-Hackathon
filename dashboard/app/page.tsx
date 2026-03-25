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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Overview() {
  const mockEarnings = {
    agentName: "PersistAgent-Alpha",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42e3b",
    totalEarnings: 2847.53,
    totalExpenses: 342.15,
    currentBalance: 2505.38,
    totalRequests: 15847,
  };

  // Dark mode colors
  const textColor = "#d4d4d8";
  const gridColor = "rgba(228, 228, 231, 0.1)";
  const pointBorderColor = "#fff";

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Earnings (USDC)",
        data: [340, 385, 412, 468, 520, 652, 789],
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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-zinc-400 text-sm">
          Agent: {mockEarnings.agentName}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Earnings" value={`$${mockEarnings.totalEarnings}`} subtext="USDC" />
        <StatCard
          label="Total Expenses"
          value={`$${mockEarnings.totalExpenses}`}
          subtext="Filecoin storage, computation"
        />
        <StatCard
          label="Current Balance"
          value={`$${mockEarnings.currentBalance}`}
          subtext="Net earnings"
        />
        <StatCard
          label="Requests Served"
          value={mockEarnings.totalRequests.toLocaleString()}
          subtext="x402 micropayments"
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
            <p className="text-zinc-400 text-sm mb-1">Wallet Address</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded px-3 py-2">
              <code className="text-cyan-400 text-sm font-mono">
                {mockEarnings.walletAddress}
              </code>
              <button className="ml-auto text-zinc-400 hover:text-white text-xs">
                Copy
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Network</p>
              <p className="text-white font-medium">Ethereum (Mainnet)</p>
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
