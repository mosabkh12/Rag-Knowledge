import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ingest", label: "Add Document" },
  { href: "/ask", label: "Ask" },
];

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-base font-semibold text-slate-900">
          RAG Knowledge Base
        </Link>
        <nav className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
