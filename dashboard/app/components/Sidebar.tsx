"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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
    <div className="w-52 h-screen sticky top-0 flex flex-col bg-[var(--color-bg)] border-r border-[var(--color-border)]">
      {/* Wordmark */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="0" y="0"  width="18" height="7"  rx="1" fill="var(--color-accent)" />
            <rect x="0" y="11" width="11" height="7"  rx="1" fill="var(--color-text)" opacity="0.2" />
          </svg>
          <span className="font-serif text-[1.05rem] font-medium text-[var(--color-text)] tracking-[-0.01em]">
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
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-[0.8125rem] transition-colors duration-100",
                  isActive
                    ? "font-medium text-[var(--color-text)] bg-[rgba(26,26,26,0.06)]"
                    : "font-normal text-[var(--color-text-muted)] hover:bg-[rgba(26,26,26,0.04)] hover:text-[var(--color-text)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[var(--color-border)]">
        {/* Agent status */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--color-success)]" />
          <span className="text-xs text-[var(--color-text-muted)]">Agent active</span>
        </div>

        {/* Wallet */}
        {connected && publicKey ? (
          <div>
            <p className="num mb-1 text-[0.7rem] text-[var(--color-text-muted)]">
              {truncateAddress(publicKey.toBase58())}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-[0.7rem] h-auto py-0"
              onClick={() => disconnect()}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setVisible(true)}
          >
            Connect wallet
          </Button>
        )}
      </div>
    </div>
  );
}
