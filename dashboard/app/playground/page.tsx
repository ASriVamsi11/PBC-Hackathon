"use client";

import { useState } from "react";
import { callAnalyze, callGenerate, callPredict } from "../../lib/api";
import { useToast } from "../components/Toast";
import type { PlaygroundResponse } from "../../lib/types";

interface EndpointConfig {
  key: string;
  label: string;
  description: string;
  price: string;
  placeholder: string;
  paramName: string;
  color: string;
  fetcher: (input: string) => Promise<PlaygroundResponse>;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    key: "analyze",
    label: "Analyze",
    description: "AI-powered data analysis",
    price: "$0.01",
    placeholder: "e.g. Bitcoin price trends 2025",
    paramName: "query",
    color: "cyan",
    fetcher: callAnalyze,
  },
  {
    key: "generate",
    label: "Generate",
    description: "AI-powered content generation",
    price: "$0.005",
    placeholder: "e.g. Write a blog intro about DeFi",
    paramName: "prompt",
    color: "blue",
    fetcher: callGenerate,
  },
  {
    key: "predict",
    label: "Predict",
    description: "Market predictions & trends",
    price: "$0.02",
    placeholder: "e.g. Solana DeFi ecosystem",
    paramName: "topic",
    color: "purple",
    fetcher: callPredict,
  },
];

const COLOR_MAP: Record<string, { badge: string; border: string; button: string }> = {
  cyan: {
    badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    border: "border-cyan-500/30 hover:border-cyan-500/60",
    button: "bg-cyan-600 hover:bg-cyan-500",
  },
  blue: {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    border: "border-blue-500/30 hover:border-blue-500/60",
    button: "bg-blue-600 hover:bg-blue-500",
  },
  purple: {
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    border: "border-purple-500/30 hover:border-purple-500/60",
    button: "bg-purple-600 hover:bg-purple-500",
  },
};

function EndpointCard({ endpoint }: { endpoint: EndpointConfig }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const colors = COLOR_MAP[endpoint.color];

  const handleRun = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const data = await endpoint.fetcher(input.trim());
      const text = data.result
        .filter((block: { type: string; text?: string }) => block.type === "text")
        .map((block: { type: string; text?: string }) => block.text || "")
        .join("\n\n");
      setResponse(text);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Request failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-zinc-800 border rounded-lg p-6 transition-colors ${colors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">{endpoint.label}</h3>
          <p className="text-zinc-400 text-xs mt-1">{endpoint.description}</p>
        </div>
        <span className={`text-xs font-mono px-2 py-1 rounded border ${colors.badge}`}>
          {endpoint.price}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-zinc-400 text-xs font-medium block mb-2">
            {endpoint.paramName}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleRun()}
            placeholder={endpoint.placeholder}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <button
          onClick={handleRun}
          disabled={loading || !input.trim()}
          className={`w-full py-3 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.button}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            "Run"
          )}
        </button>

        {response && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 max-h-80 overflow-y-auto">
            <p className="text-zinc-400 text-xs font-medium mb-2">Response</p>
            <div className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Playground</h1>
        <p className="text-zinc-400 text-sm">
          Test the agent's AI endpoints interactively. These demo calls are free and bypass x402 payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.key} endpoint={ep} />
        ))}
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h3 className="text-white font-bold mb-3">How it works</h3>
        <div className="space-y-2 text-sm text-zinc-400">
          <p>
            In production, these endpoints are gated by <span className="text-cyan-400 font-mono">x402</span> micropayments on Solana.
            Clients pay per request and the agent earns revenue automatically.
          </p>
          <p>
            This playground uses free demo routes so you can test the agent without a wallet.
            Each request still generates memory entries and activity logs.
          </p>
        </div>
      </div>
    </div>
  );
}
