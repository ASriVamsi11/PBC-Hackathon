"use client";

import { useState } from "react";
import { getActivity } from "../../lib/api";
import { usePolling } from "../../lib/usePolling";
import { SkeletonCard, SkeletonEventCard } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import type { ActivityEvent } from "../../lib/types";

const EVENT_STYLES: Record<string, { marker: string; color: string }> = {
  earning: { marker: "#C9A84C", color: "var(--color-gold)" },
  storage: { marker: "#4A6FA5", color: "#4A6FA5" },
  reputation: { marker: "#C9A84C", color: "var(--color-gold-dim)" },
  system: { marker: "#8A8070", color: "var(--color-text-muted)" },
};

export default function ActivityPage() {
  const { data: events, loading, error, refetch } = usePolling<ActivityEvent[]>(getActivity, 5000);
  const [filter, setFilter] = useState("all");

  const allEvents = events || [];

  const filteredEvents =
    filter === "all"
      ? allEvents
      : allEvents.filter((e) => e.type === filter);

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diff = Math.floor((now.getTime() - eventTime.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const earningEvents = allEvents.filter((e) => e.type === "earning");
  const todayEarnings = earningEvents.reduce((sum, e) => {
    const match = e.title.match(/\$([0-9.]+)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <div className="h-8 w-40 rounded animate-pulse" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 w-60 rounded animate-pulse mt-2" style={{ background: "var(--color-surface-2)" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonEventCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "earning", label: "Earnings" },
    { value: "storage", label: "Storage" },
    { value: "reputation", label: "Reputation" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          Activity Feed
        </h1>
        <p className="label-section mt-1">Auto-refreshes every 5s</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Earnings" value={`$${todayEarnings.toFixed(4)}`} sub="from activity events" />
        <StatCard label="Total Events" value={String(allEvents.length)} sub="since server start" />
        <StatCard label="Earning Events" value={String(earningEvents.length)} sub="paid requests served" />
        <StatCard label="Storage Events" value={String(allEvents.filter((e) => e.type === "storage").length)} sub="Filecoin flushes" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className="px-3 py-1.5 text-xs font-medium transition-colors duration-150"
            style={{
              background: filter === opt.value ? "var(--color-gold)" : "transparent",
              color: filter === opt.value ? "var(--color-bg)" : "var(--color-text-muted)",
              border: filter === opt.value ? "1px solid var(--color-gold)" : "1px solid var(--color-border)",
              borderRadius: "3px",
              fontWeight: filter === opt.value ? 600 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Event Timeline */}
      <div className="space-y-0" style={{ border: "1px solid var(--color-border)" }}>
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center" style={{ background: "var(--color-surface)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No events yet. Make requests to the agent to generate activity.
            </p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const style = EVENT_STYLES[event.type] || EVENT_STYLES.system;
            return (
              <div
                key={event.id}
                className={`flex gap-4 px-5 py-4 animate-fade-in ${idx % 2 === 0 ? "table-row-even" : "table-row-odd"}`}
                style={{ borderBottom: idx < filteredEvents.length - 1 ? "1px solid var(--color-border)" : "none" }}
              >
                {/* Marker */}
                <div className="flex-shrink-0 pt-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: style.marker }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {event.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {event.description}
                  </p>
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-right">
                  <p className="num text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {getTimeAgo(event.timestamp)}
                  </p>
                  <p className="num text-xs mt-0.5" style={{ color: "var(--color-gold-dim)" }}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="animate-fade-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "20px" }}>
        <p className="label-section mb-3">Event Types</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {Object.entries(EVENT_STYLES).map(([type, style]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: style.marker }} />
              <span style={{ color: "var(--color-text-muted)" }} className="capitalize">{type}</span>
            </div>
          ))}
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
