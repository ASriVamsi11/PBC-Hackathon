"use client";

import { useState } from "react";

export default function ActivityPage() {
  const mockEvents = [
    {
      id: 1,
      type: "earnings",
      title: "Earned $0.015 for /api/analyze",
      description: "Successfully processed 3 analysis requests",
      timestamp: "2026-03-24 14:32:10",
      icon: "💰",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      id: 2,
      type: "storage",
      title: "Memory flushed to Filecoin",
      description: "Archived 2.4 MB memory snapshot (CID: QmY9Y...)",
      timestamp: "2026-03-24 13:28:45",
      icon: "💾",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      id: 3,
      type: "reputation",
      title: "Reputation updated to 502",
      description: "Score increased due to positive request feedback",
      timestamp: "2026-03-23 12:15:20",
      icon: "📈",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      id: 4,
      type: "earnings",
      title: "Earned $0.008 for /api/predict",
      description: "Served 5 prediction requests",
      timestamp: "2026-03-23 11:42:33",
      icon: "💰",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      id: 5,
      type: "system",
      title: "Health check passed",
      description: "All agent subsystems operational",
      timestamp: "2026-03-23 11:00:00",
      icon: "✅",
      color: "text-white",
      bgColor: "bg-zinc-700/30",
      borderColor: "border-zinc-600/30",
    },
    {
      id: 6,
      type: "earnings",
      title: "Earned $0.012 for /api/analyze",
      description: "Successfully processed 2 analysis requests",
      timestamp: "2026-03-22 10:15:55",
      icon: "💰",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      id: 7,
      type: "storage",
      title: "Memory snapshot queued for Filecoin",
      description: "1.8 MB of event logs prepared for archival",
      timestamp: "2026-03-22 09:30:11",
      icon: "⏳",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      id: 8,
      type: "earnings",
      title: "Earned $0.022 for /api/generate",
      description: "Served 8 text generation requests",
      timestamp: "2026-03-22 08:45:22",
      icon: "💰",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      id: 9,
      type: "reputation",
      title: "Reputation increased by 5 points",
      description: "100% positive feedback on last 50 requests",
      timestamp: "2026-03-21 07:20:00",
      icon: "⭐",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
    {
      id: 10,
      type: "system",
      title: "Daily summary report generated",
      description: "Previous 24h: $0.087 earned, 156 requests served",
      timestamp: "2026-03-21 00:00:00",
      icon: "📊",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    },
  ];

  const [filter, setFilter] = useState("all");

  const filteredEvents =
    filter === "all"
      ? mockEvents
      : mockEvents.filter((e) => e.type === filter);

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diff = Math.floor((now.getTime() - eventTime.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Activity Feed</h1>
        <p className="text-zinc-400 text-sm">Real-time agent actions and events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Today's Earnings</p>
          <p className="text-white text-2xl font-bold">$0.087</p>
          <p className="text-zinc-500 text-xs mt-2">+12.3% vs yesterday</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Requests Served</p>
          <p className="text-white text-2xl font-bold">156</p>
          <p className="text-zinc-500 text-xs mt-2">active sessions: 3</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Uptime</p>
          <p className="text-white text-2xl font-bold">99.97%</p>
          <p className="text-zinc-500 text-xs mt-2">last 7 days</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Avg Response</p>
          <p className="text-white text-2xl font-bold">142ms</p>
          <p className="text-zinc-500 text-xs mt-2">A+ performance</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        {[
          { value: "all", label: "All Events" },
          { value: "earnings", label: "Earnings" },
          { value: "storage", label: "Storage" },
          { value: "reputation", label: "Reputation" },
          { value: "system", label: "System" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === opt.value
                ? "bg-cyan-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Event Timeline */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className={`border rounded-lg p-6 transition-all hover:border-opacity-100 ${event.borderColor} ${event.bgColor} border-opacity-50`}
          >
            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 text-2xl pt-1">{event.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm md:text-base">
                      {event.title}
                    </h3>
                    <p className="text-zinc-400 text-xs md:text-sm mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-right">
                <p className="text-zinc-500 text-xs font-mono">
                  {getTimeAgo(event.timestamp)}
                </p>
                <p className="text-zinc-600 text-xs mt-1 whitespace-nowrap">
                  {event.timestamp.split(" ")[1]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <button className="px-6 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm font-medium">
          Load More Events
        </button>
      </div>

      {/* Legend */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mt-8">
        <h3 className="text-white font-bold mb-4">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-zinc-400">Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💾</span>
            <span className="text-zinc-400">Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-zinc-400">Reputation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-zinc-400">System</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <span className="text-zinc-400">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
