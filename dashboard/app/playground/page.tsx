"use client";

import { useState, useRef, useEffect } from "react";
import { callAnalyze, callGenerate, callPredict, chatStream } from "../../lib/api";
import { callPaidAnalyze, callPaidGenerate, callPaidPredict } from "../../lib/paidApi";
import { useX402 } from "../../lib/useX402";
import { useToast } from "../components/Toast";
import type { PlaygroundResponse, ChatMessage } from "../../lib/types";

/* ─── Advanced Mode: Endpoint Cards ─── */

interface EndpointConfig {
  key: string;
  label: string;
  description: string;
  price: string;
  placeholder: string;
  paramName: string;
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
    fetcher: callAnalyze,
  },
  {
    key: "generate",
    label: "Generate",
    description: "AI-powered content generation",
    price: "$0.005",
    placeholder: "e.g. Write a blog intro about DeFi",
    paramName: "prompt",
    fetcher: callGenerate,
  },
  {
    key: "predict",
    label: "Predict",
    description: "Market predictions & trends",
    price: "$0.02",
    placeholder: "e.g. Solana DeFi ecosystem",
    paramName: "topic",
    fetcher: callPredict,
  },
];

function EndpointCard({ endpoint }: { endpoint: EndpointConfig }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { canPay, paidFetch } = useX402();

  const PAID_CALLERS: Record<string, (pf: NonNullable<typeof paidFetch>, v: string) => Promise<PlaygroundResponse>> = {
    analyze: callPaidAnalyze,
    generate: callPaidGenerate,
    predict: callPaidPredict,
  };

  const handleRun = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      let data: PlaygroundResponse;
      if (canPay && paidFetch && PAID_CALLERS[endpoint.key]) {
        data = await PAID_CALLERS[endpoint.key](paidFetch, input.trim());
        toast(`Paid ${endpoint.price} via x402`, "success");
      } else {
        data = await endpoint.fetcher(input.trim());
      }
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
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        padding: "24px",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif text-base" style={{ color: "var(--color-text)", fontWeight: 400 }}>
            {endpoint.label}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{endpoint.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5"
            style={{
              color: "var(--color-neutral)",
              border: "1px solid var(--color-border)",
              borderRadius: "3px",
            }}
          >
            {canPay ? "Paid" : "Free Demo"}
          </span>
          <span
            className="num text-xs px-2 py-1"
            style={{
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "3px",
            }}
          >
            {endpoint.price}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label-section block mb-1.5">{endpoint.paramName}</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleRun()}
            placeholder={endpoint.placeholder}
            className="w-full px-3 py-2.5 text-sm transition-colors duration-150 focus:outline-none"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              color: "var(--color-text)",
              fontFamily: "var(--font-sans)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-text)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={loading || !input.trim()}
          className="w-full py-2.5 text-sm transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--color-text)",
            color: "var(--color-bg)",
            borderRadius: "4px",
            fontFamily: "var(--font-sans)",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {loading ? "Processing..." : "Run"}
        </button>

        {response && (
          <div
            className="max-h-72 overflow-y-auto p-3"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "4px" }}
          >
            <p className="label-section mb-1.5">Response</p>
            <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--color-text)" }}>
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

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

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
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-12 h-12 flex items-center justify-center mb-4"
              style={{ border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg mb-1" style={{ color: "var(--color-text)", fontWeight: 400 }}>
              Chat with MintAI
            </h3>
            <p className="text-xs max-w-sm" style={{ color: "var(--color-text-muted)" }}>
              Analyze data, generate content, or predict market trends.
              Each request is processed by one of the agent's AI capabilities.
            </p>
            <div className="flex gap-2 mt-4">
              {["Analyze $0.01", "Generate $0.005", "Predict $0.02"].map((label) => (
                <span
                  key={label}
                  className="num text-xs px-2 py-1"
                  style={{
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "3px",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[75%] px-4 py-3 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: "var(--color-text)",
                      color: "var(--color-bg)",
                      borderRadius: "4px 4px 0 4px",
                    }
                  : {
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                      borderRadius: "4px 4px 4px 0",
                    }
              }
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" && isStreaming && i === messages.length - 1 && (
                <span
                  className="inline-block w-1.5 h-4 animate-pulse ml-0.5 align-text-bottom"
                  style={{ background: "var(--color-neutral)" }}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-6 py-4"
        style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message MintAI..."
            rows={1}
            className="flex-1 px-3 py-2.5 text-sm transition-colors duration-150 resize-none focus:outline-none"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              color: "var(--color-text)",
              fontFamily: "var(--font-sans)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-text)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-3 py-2.5 transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--color-text)",
              color: "var(--color-bg)",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => { if (!isStreaming) e.currentTarget.style.opacity = "0.8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
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
  const { canPay } = useX402();

  return (
    <div className={advancedMode ? "p-8 space-y-6" : "flex flex-col h-full"}>
      {/* Header */}
      <div className={`flex items-center justify-between ${advancedMode ? "" : "px-8 pt-8 pb-4"}`}>
        <div>
          <h1 className="font-serif text-2xl" style={{ color: "var(--color-text)", fontWeight: 400 }}>
            Playground
          </h1>
          <p className="label-section mt-1">
            {advancedMode ? "Test endpoints interactively" : "Chat with MintAI"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!advancedMode && (
            <button
              onClick={() => setChatKey((k) => k + 1)}
              className="text-xs transition-opacity duration-150"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Clear Chat
            </button>
          )}
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className="text-xs px-3 py-1.5 transition-opacity duration-150"
            style={{
              color: "var(--color-text)",
              border: "1px solid var(--color-text)",
              background: "transparent",
              borderRadius: "4px",
              fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {advancedMode ? "Switch to Chat" : "Advanced Mode"}
          </button>
        </div>
      </div>

      {/* Content */}
      {advancedMode ? (
        <>
          {!canPay && (
            <div
              className="flex items-center gap-3 px-4 py-3 text-xs"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderLeft: "3px solid var(--color-accent)",
                color: "var(--color-text-muted)",
                borderRadius: "4px",
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--color-accent)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
              </svg>
              Connect your wallet to use paid endpoints — real Solana devnet USDC micropayments via x402
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {ENDPOINTS.map((ep) => (
              <EndpointCard key={ep.key} endpoint={ep} />
            ))}
          </div>

          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              padding: "20px",
            }}
          >
            <p className="label-section mb-3">How it works</p>
            <div className="space-y-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <p>
                In production, these endpoints are gated by{" "}
                <span className="num" style={{ color: "var(--color-accent)" }}>x402</span>{" "}
                micropayments on Solana. Clients pay per request and the agent earns revenue automatically.
              </p>
              <p>
                This playground uses free demo routes so you can test without a wallet.
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
