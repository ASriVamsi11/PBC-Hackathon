"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Overview", icon: "📊" },
    { href: "/storage", label: "Storage", icon: "💾" },
    { href: "/identity", label: "Identity", icon: "🔐" },
    { href: "/activity", label: "Activity", icon: "⚡" },
  ];

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">PA</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">PersistAgent</h1>
            <p className="text-zinc-400 text-xs">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-cyan-600 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 space-y-4">
        {/* Status */}
        <div className="text-xs text-zinc-500">
          <p className="font-semibold text-zinc-400 mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
