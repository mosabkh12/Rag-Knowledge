import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Knowledge Base Assistant",
  description:
    "A production-ready Retrieval-Augmented Generation assistant built with Next.js, Supabase pgvector, and OpenAI.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "RAG Knowledge Base Assistant",
    description:
      "Ask questions grounded strictly in your own documents, powered by Retrieval-Augmented Generation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-[#f7f8fb] font-sans text-slate-900 antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-slate [mask-image:radial-gradient(ellipse_80%_60%_at_50%_-10%,black,transparent)]" />
        <Header />
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
