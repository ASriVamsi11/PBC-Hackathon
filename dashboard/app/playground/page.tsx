"use client";

import { useState, useRef, useEffect } from "react";
import { callAnalyze, callGenerate, callPredict, chatStream } from "../../lib/api";
import { useToast } from "../components/Toast";
import type { PlaygroundResponse, ChatMessage } from "../../lib/types";

/* ─── Advanced Mode: Original Endpoint Cards ─── */

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

/* ─── Chat Mode ─── */

function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed, timestamp: new Date() };
    const assistantMsg: ChatMessage = { role: "assistant", content: "", timestamp: new Date() };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Send last 10 messages as history (excluding the new user message — it's sent separately)
    const history = [...messages, userMsg].slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await chatStream(
        trimmed,
        history,
        (text) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, content: last.content + text };
            return updated;
          });
        },
        () => {
          setIsStreaming(false);
        },
        (err) => {
          toast(err, "error");
          setIsStreaming(false);
        },
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Chat failed", "error");
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Chat with PersistAgent</h3>
            <p className="text-zinc-400 text-sm max-w-md">
              Ask me to analyze data, generate content, or predict market trends.
              Each request is processed by one of my AI capabilities.
            </p>
            <div className="flex gap-2 mt-4">
              <span className="text-xs font-mono px-2 py-1 rounded border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Analyze $0.01</span>
              <span className="text-xs font-mono px-2 py-1 rounded border bg-blue-500/20 text-blue-400 border-blue-500/30">Generate $0.005</span>
              <span className="text-xs font-mono px-2 py-1 rounded border bg-purple-500/20 text-purple-400 border-purple-500/30">Predict $0.02</span>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-600 text-white rounded-br-md"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-md"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" && isStreaming && i === messages.length - 1 && (
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5 align-text-bottom" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-700 px-4 py-4 bg-zinc-900">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message PersistAgent..."
            rows={1}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function PlaygroundPage() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  return (
    <div className={advancedMode ? "p-8 space-y-8" : "flex flex-col h-full"}>
      {/* Header */}
      <div className={`flex items-center justify-between ${advancedMode ? "" : "px-8 pt-8 pb-4"}`}>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Playground</h1>
          <p className="text-zinc-400 text-sm">
            {advancedMode
              ? "Test the agent's AI endpoints interactively. These demo calls are free and bypass x402 payment."
              : "Chat with PersistAgent-Alpha. Demo mode — free, no wallet needed."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!advancedMode && (
            <button
              onClick={() => setChatKey((k) => k + 1)}
              className="text-zinc-400 hover:text-white text-xs transition-colors"
            >
              Clear Chat
            </button>
          )}
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            {advancedMode ? "Switch to Chat" : "Advanced Mode"}
          </button>
        </div>
      </div>

      {/* Content */}
      {advancedMode ? (
        <>
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
        </>
      ) : (
        <ChatView key={chatKey} />
      )}
    </div>
  );
}
