"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, Library, MessageCircleQuestion } from "lucide-react";

const NAV_LINKS = [
  { href: "/documents", label: "Library", icon: Library },
  { href: "/ingest", label: "Add Document", icon: FileUp },
  { href: "/ask", label: "Ask", icon: MessageCircleQuestion },
];

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7d95f8" />
          <stop offset="1" stopColor="#4049e3" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <circle cx="10" cy="11" r="2.6" fill="white" />
      <circle cx="22" cy="10" r="2.2" fill="white" fillOpacity="0.85" />
      <circle cx="22" cy="21" r="2.6" fill="white" />
      <circle cx="10" cy="22" r="2.2" fill="white" fillOpacity="0.85" />
      <path
        d="M10 11L22 10M10 11L22 21M22 10L22 21M10 11L10 22M10 22L22 21"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            RAG Knowledge Base
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={2.25}
                  className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
