import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Knowledge Base Assistant",
  description:
    "A production-ready Retrieval-Augmented Generation assistant built with Next.js, Supabase pgvector, and OpenAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
