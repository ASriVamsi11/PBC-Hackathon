"use client";

import { useState } from "react";
import Link from "next/link";
import { getMemories, flushMemory } from "../../lib/api";
import { usePolling } from "../../lib/usePolling";
import { useToast } from "../components/Toast";
import { SkeletonCard, SkeletonTableRow } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import type { MemoriesResponse } from "../../lib/types";

export default function StoragePage() {
  const { data, loading, error, refetch } = usePolling<MemoriesResponse>(getMemories, 10000);
  const [flushing, setFlushing] = useState(false);
  const { toast } = useToast();

  const truncateCID = (cid: string) => {
    if (cid.length <= 24) return cid;
    return `${cid.slice(0, 12)}...${cid.slice(-12)}`;
  };

  const handleFlush = async () => {
    setFlushing(true);
    try {
      await flushMemory();
      toast("Memory flushed successfully", "success");
      refetch();
    } catch {
      toast("Failed to flush memory", "error");
    } finally {
      setFlushing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <div className="h-8 w-32 rounded animate-pulse" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 w-56 rounded animate-pulse mt-2" style={{ background: "var(--color-surface-2)" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "24px" }}>
          <div className="h-5 w-40 rounded animate-pulse mb-6" style={{ background: "var(--color-surface-2)" }} />
          <table className="w-full text-sm">
            <tbody>
              {[...Array(3)].map((_, i) => <SkeletonTableRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const batches = data?.batches || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl" style={{ color: "var(--color-text)", fontWeight: 400 }}>
          Storage
        </h1>
        <p className="label-section mt-1">Memory archives on Filecoin &middot; {batches.length} records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="animate-fade-in"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "24px" }}
        >
          <p className="label-section mb-3">Total Batches</p>
          <p className="num font-serif" style={{ color: "var(--color-text)", fontSize: "1.75rem", fontWeight: 500 }}>
            {data?.totalBatches || 0}
          </p>
          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>flushed to Filecoin</p>
        </div>

        <div
          className="animate-fade-in"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "24px" }}
        >
          <p className="label-section mb-3">Buffer Size</p>
          <p className="num font-serif" style={{ color: "var(--color-text)", fontSize: "1.75rem", fontWeight: 500 }}>
            {data?.currentBufferSize || 0}
          </p>
          <button
            onClick={handleFlush}
            disabled={data?.currentBufferSize === 0 || flushing}
            className="mt-3 px-3 py-1.5 text-xs transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--color-text)",
              color: "var(--color-bg)",
              borderRadius: "4px",
              fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={(e) => { if (!flushing) e.currentTarget.style.opacity = "0.8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {flushing ? "Flushing..." : "Flush Memory"}
          </button>
        </div>

        <div
          className="animate-fade-in"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "24px" }}
        >
          <p className="label-section mb-3">Index CID</p>
          <p className="num text-sm break-all" style={{ color: "var(--color-accent)" }}>
            {data?.indexCID ? truncateCID(data.indexCID) : "None yet"}
          </p>
          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>latest memory index</p>
        </div>
      </div>

      {/* Table */}
      <div
        className="animate-fade-in overflow-hidden"
        style={{ border: "1px solid var(--color-border)", borderRadius: "6px" }}
      >
        <div className="px-5 py-4" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <p className="label-section">Memory Archives</p>
        </div>
        {batches.length === 0 ? (
          <div className="px-5 py-8 text-center" style={{ background: "var(--color-surface)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No memory batches flushed yet. Make some requests to generate data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <th className="text-left px-5 py-3 label-section">Batch</th>
                  <th className="text-left px-5 py-3 label-section">CID</th>
                  <th className="text-right px-5 py-3 label-section">Entries</th>
                  <th className="text-right px-5 py-3 label-section">Flushed At</th>
                  <th className="text-right px-5 py-3 label-section">Action</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, idx) => (
                  <tr
                    key={batch.batchId}
                    className={idx % 2 === 0 ? "table-row-even" : "table-row-odd"}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td className="px-5 py-3" style={{ color: "var(--color-text)" }}>#{batch.batchId}</td>
                    <td className="px-5 py-3">
                      <code className="num" style={{ color: "var(--color-accent)" }}>
                        {truncateCID(batch.cid)}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-right num" style={{ color: "var(--color-text)" }}>{batch.entryCount}</td>
                    <td className="px-5 py-3 text-right num" style={{ color: "var(--color-text-muted)" }}>
                      {new Date(batch.flushedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`https://gateway.lighthouse.storage/ipfs/${batch.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs transition-opacity duration-150"
                        style={{ color: "var(--color-accent)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                      >
                        View ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filecoin Info */}
      <div
        className="animate-fade-in"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "20px" }}
      >
        <p className="label-section mb-4">Filecoin Storage</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="label-section mb-1" style={{ fontSize: "9px" }}>Network</p>
            <p style={{ color: "var(--color-text)" }}>Filecoin (Lighthouse)</p>
          </div>
          <div>
            <p className="label-section mb-1" style={{ fontSize: "9px" }}>Deal Status</p>
            <p style={{ color: "var(--color-success)" }}>Active</p>
          </div>
          <div>
            <p className="label-section mb-1" style={{ fontSize: "9px" }}>Provider</p>
            <p style={{ color: "var(--color-text)" }}>Lighthouse Protocol</p>
          </div>
          <div>
            <p className="label-section mb-1" style={{ fontSize: "9px" }}>Gateway</p>
            <p className="num" style={{ color: "var(--color-text)" }}>gateway.lighthouse.storage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
