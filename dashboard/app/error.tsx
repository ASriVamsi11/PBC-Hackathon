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
        <div
          className="w-10 h-10 mx-auto flex items-center justify-center"
          style={{ border: "1px solid var(--color-danger)", color: "var(--color-danger)" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="font-serif text-lg" style={{ color: "var(--color-text)", fontWeight: 400 }}>
          Something went wrong
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{error.message}</p>
        <button
          onClick={() => unstable_retry()}
          className="px-4 py-2 text-xs transition-opacity duration-150"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            borderRadius: "4px",
            fontFamily: "var(--font-sans)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
