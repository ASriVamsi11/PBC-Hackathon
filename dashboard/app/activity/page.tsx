"use client";

import { useState, useEffect } from "react";
import { getActivity } from "../../lib/api";

interface ActivityEvent {
  id: number;
  type: "earning" | "storage" | "reputation" | "system";
  title: string;
  description: string;
  timestamp: string;
}

const EVENT_CONFIG: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  earning: { icon: "\ud83d\udcb0", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  storage: { icon: "\ud83d\udcbe", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  reputation: { icon: "\u2b50", color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" },
  system: { icon: "\u2705", color: "text-white", bgColor: "bg-zinc-700/30", borderColor: "border-zinc-600/30" },
};

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getActivity()
      .then(setEvents)
      .catch((err) => console.error("Failed to fetch activity:", err))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      getActivity().then(setEvents).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((e) => e.type === filter);

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diff = Math.floor((now.getTime() - eventTime.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const earningEvents = events.filter((e) => e.type === "earning");
  const todayEarnings = earningEvents.reduce((sum, e) => {
    const match = e.title.match(/\$([0-9.]+)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <p className="text-zinc-400 text-lg">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Activity Feed</h1>
        <p className="text-zinc-400 text-sm">Real-time agent actions and events (auto-refreshes every 5s)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Total Earnings</p>
          <p className="text-white text-2xl font-bold">${todayEarnings.toFixed(4)}</p>
          <p className="text-zinc-500 text-xs mt-2">from activity events</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Total Events</p>
          <p className="text-white text-2xl font-bold">{events.length}</p>
          <p className="text-zinc-500 text-xs mt-2">since server start</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Earning Events</p>
          <p className="text-white text-2xl font-bold">{earningEvents.length}</p>
          <p className="text-zinc-500 text-xs mt-2">paid requests served</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Storage Events</p>
          <p className="text-white text-2xl font-bold">{events.filter((e) => e.type === "storage").length}</p>
          <p className="text-zinc-500 text-xs mt-2">Filecoin flushes</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        {[
          { value: "all", label: "All Events" },
          { value: "earning", label: "Earnings" },
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
        {filteredEvents.length === 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
            <p className="text-zinc-400">No events yet. Make requests to the agent to generate activity.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.system;
            return (
              <div
                key={event.id}
                className={`border rounded-lg p-6 transition-all hover:border-opacity-100 ${cfg.borderColor} ${cfg.bgColor} border-opacity-50`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-2xl pt-1">{cfg.icon}</div>
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
                  <div className="flex-shrink-0 text-right">
                    <p className="text-zinc-500 text-xs font-mono">
                      {getTimeAgo(event.timestamp)}
                    </p>
                    <p className="text-zinc-600 text-xs mt-1 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mt-8">
        <h3 className="text-white font-bold mb-4">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{"\ud83d\udcb0"}</span>
            <span className="text-zinc-400">Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{"\ud83d\udcbe"}</span>
            <span className="text-zinc-400">Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{"\u2b50"}</span>
            <span className="text-zinc-400">Reputation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{"\u2705"}</span>
            <span className="text-zinc-400">System</span>
          </div>
        </div>
      </div>
    </div>
  );
}
