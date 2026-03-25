"use client";

import Link from "next/link";

export default function StoragePage() {
  const mockCIDs = [
    {
      id: 1,
      cid: "QmY9YtFRWMzDvf6EVKCfz7mzQN5Kn5L2mPjX5cR9hK7Xq",
      timestamp: "2024-03-22 14:32:10",
      size: "2.4 MB",
      type: "Memory Snapshot",
    },
    {
      id: 2,
      cid: "QmX8WuEoL3nQpS2tM6vR4jK5bL9mN1pQ3cT7uV2wX6yZ",
      timestamp: "2024-03-21 09:15:45",
      size: "1.8 MB",
      type: "Training Data",
    },
    {
      id: 3,
      cid: "QmZ7YtEwVkSrQoMxNyJiHgFdEcBaZ5XwUvTsRqPnOnL",
      timestamp: "2024-03-20 22:48:22",
      size: "3.1 MB",
      type: "Memory Snapshot",
    },
    {
      id: 4,
      cid: "QmV6UsSuRtMqPpOoDcIbHfEmGjKlJ3ShRpOkMnLqK5vT",
      timestamp: "2024-03-19 18:20:11",
      size: "2.2 MB",
      type: "Event Log",
    },
    {
      id: 5,
      cid: "QmW5TrRqQmPlOkNjMhLgJiFdCeBlZ4YxVsUqTpRoNmM",
      timestamp: "2024-03-18 11:05:33",
      size: "2.9 MB",
      type: "Memory Snapshot",
    },
  ];

  const truncateCID = (cid: string) => {
    return `${cid.slice(0, 12)}...${cid.slice(-12)}`;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Storage</h1>
        <p className="text-zinc-400 text-sm">
          Memory archives stored on Filecoin ({mockCIDs.length} records)
        </p>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Total Stored</p>
          <p className="text-white text-2xl font-bold">14.4 MB</p>
          <p className="text-zinc-500 text-xs mt-2">5 memory archives</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">
            Storage Cost
          </p>
          <p className="text-white text-2xl font-bold">$2.15</p>
          <p className="text-zinc-500 text-xs mt-2">Annual estimate</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-zinc-400 text-sm font-medium mb-2">Redundancy</p>
          <p className="text-white text-2xl font-bold">6x</p>
          <p className="text-zinc-500 text-xs mt-2">Across Filecoin nodes</p>
        </div>
      </div>

      {/* CID List */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6">Memory Archives</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                  CID
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {mockCIDs.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-700 hover:bg-zinc-700/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <code className="text-cyan-400 font-mono text-xs">
                      {truncateCID(item.cid)}
                    </code>
                  </td>
                  <td className="px-4 py-4 text-white">{item.type}</td>
                  <td className="px-4 py-4 text-zinc-300">{item.size}</td>
                  <td className="px-4 py-4 text-zinc-300">{item.timestamp}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`https://gateway.lighthouse.storage/ipfs/${item.cid}`}
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
      </div>

      {/* Filecoin Info */}
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Filecoin Storage</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-zinc-400">
          <p>
            <span className="text-gray-900 dark:text-white font-medium">Network:</span> Filecoin
            Mainnet
          </p>
          <p>
            <span className="text-gray-900 dark:text-white font-medium">Deal Status:</span>{" "}
            <span className="text-green-600 dark:text-green-400">Active</span>
          </p>
          <p>
            <span className="text-gray-900 dark:text-white font-medium">Replication Factor:</span>{" "}
            6 copies across independent nodes
          </p>
          <p>
            <span className="text-gray-900 dark:text-white font-medium">Provider:</span> Lighthouse
            Protocol
          </p>
        </div>
      </div>
    </div>
  );
}
