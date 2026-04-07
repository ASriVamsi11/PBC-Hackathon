"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const NAV_LINKS = [
  { href: "/",           label: "Overview"    },
  { href: "/playground", label: "Playground"  },
  { href: "/storage",    label: "Storage"     },
  { href: "/identity",   label: "Identity"    },
  { href: "/activity",   label: "Activity"    },
];

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div
      className="w-52 h-screen sticky top-0 flex flex-col"
      style={{ background: "var(--color-bg)", borderRight: "1px solid var(--color-border)" }}
    >
      {/* Wordmark */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          {/* Minimal logomark — two stacked bars, like an abstract "M" */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <rect x="0" y="0"  width="18" height="7"  rx="1" fill="var(--color-accent)" />
            <rect x="0" y="11" width="11" height="7"  rx="1" fill="var(--color-text)" opacity="0.2" />
          </svg>
          <span
            className="font-serif"
            style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--color-text)", letterSpacing: "-0.01em" }}
          >
            MintAI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-3 py-2 rounded transition-colors duration-100 ease-out"
                style={{
                  fontSize: "0.8125rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                  background: isActive ? "rgba(26,26,26,0.06)" : "transparent",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(26,26,26,0.04)";
                    e.currentTarget.style.color = "var(--color-text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-text-muted)";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-5" style={{ borderTop: "1px solid var(--color-border)" }}>
        {/* Agent status */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--color-success)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
            Agent active
          </span>
        </div>

        {/* Wallet */}
        {connected && publicKey ? (
          <div>
            <p
              className="num mb-1"
              style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}
            >
              {truncateAddress(publicKey.toBase58())}
            </p>
            <button
              onClick={() => disconnect()}
              style={{
                fontSize: "0.7rem",
                color: "var(--color-neutral)",
                fontFamily: "var(--font-sans)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-neutral)"; }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className="w-full py-1.5 transition-opacity duration-150"
            style={{
              fontSize: "0.75rem",
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-muted)",
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-text-muted)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            Connect wallet
          </button>
        )}
      </div>
    </div>
  );
}
