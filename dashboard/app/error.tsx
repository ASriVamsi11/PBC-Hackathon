"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="text-4xl">&#x26A0;&#xFE0F;</div>
        <h2 className="text-white text-xl font-bold">Something went wrong</h2>
        <p className="text-zinc-400 text-sm">{error.message}</p>
        <button
          onClick={() => unstable_retry()}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
