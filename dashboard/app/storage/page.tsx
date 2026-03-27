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
      toast("Memory flushed successfully!", "success");
      refetch();
    } catch {
      toast("Failed to flush memory", "error");
    } finally {
      setFlushing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 w-32 bg-zinc-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-zinc-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <div className="h-6 w-40 bg-zinc-700 rounded animate-pulse mb-6" />
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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Storage</h1>
        <p className="text-zinc-400 text-sm">
          Memory archives stored on Filecoin ({batches.length} records)
        </p>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
          <p className="text-zinc-400 text-sm font-medium mb-2">Total Batches</p>
          <p className="text-white text-2xl font-bold">{data?.totalBatches || 0}</p>
          <p className="text-zinc-500 text-xs mt-2">flushed to Filecoin</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
          <p className="text-zinc-400 text-sm font-medium mb-2">Buffer Size</p>
          <p className="text-white text-2xl font-bold">{data?.currentBufferSize || 0}</p>
          <button
            onClick={handleFlush}
            disabled={data?.currentBufferSize === 0 || flushing}
            className="mt-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
          >
            {flushing ? "Flushing..." : "Flush Memory"}
          </button>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-fade-in-up">
          <p className="text-zinc-400 text-sm font-medium mb-2">Index CID</p>
          <p className="text-white text-sm font-mono break-all">
            {data?.indexCID ? truncateCID(data.indexCID) : "None yet"}
          </p>
          <p className="text-zinc-500 text-xs mt-2">latest memory index</p>
        </div>
      </div>

      {/* CID List */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6">Memory Archives</h2>
        {batches.length === 0 ? (
          <p className="text-zinc-400 text-sm">No memory batches flushed yet. Make some requests to the agent to generate data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Batch</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">CID</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Entries</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Flushed At</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr
                    key={batch.batchId}
                    className="border-b border-zinc-700 hover:bg-zinc-700/30 transition-colors"
                  >
                    <td className="px-4 py-4 text-white">#{batch.batchId}</td>
                    <td className="px-4 py-4">
                      <code className="text-cyan-400 font-mono text-xs">
                        {truncateCID(batch.cid)}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">{batch.entryCount}</td>
                    <td className="px-4 py-4 text-zinc-300">
                      {new Date(batch.flushedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`https://gateway.lighthouse.storage/ipfs/${batch.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 text-xs font-medium"
                      >
                        View
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
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Filecoin Storage</h2>
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            <span className="text-white font-medium">Network:</span> Filecoin (via Lighthouse)
          </p>
          <p>
            <span className="text-white font-medium">Deal Status:</span>{" "}
            <span className="text-green-400">Active</span>
          </p>
          <p>
            <span className="text-white font-medium">Provider:</span> Lighthouse Protocol
          </p>
          <p>
            <span className="text-white font-medium">Gateway:</span> gateway.lighthouse.storage
          </p>
        </div>
      </div>
    </div>
  );
}
