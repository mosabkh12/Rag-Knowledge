"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CalendarDays,
  Layers,
  ChevronDown,
  Trash2,
  Loader2,
  Library,
  Plus,
} from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import type { DocumentDetailResponse, ListDocumentsResponse } from "@/types/api";
import type { DocumentSummary } from "@/types/document";

type LoadStatus = "loading" | "success" | "error";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function DocumentList() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const response = await fetch("/api/documents");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load documents.");
        }

        if (!cancelled) {
          setDocuments((data as ListDocumentsResponse).documents);
          setStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleDeleted(id: string) {
    setDocuments((current) => current.filter((doc) => doc.id !== id));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500 shadow-soft">
        <Loader2 size={16} strokeWidth={2.25} className="animate-spin text-brand-600" />
        Loading your documents...
      </div>
    );
  }

  if (status === "error") {
    return <Alert variant="error">{errorMessage}</Alert>;
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <Library size={26} strokeWidth={1.75} className="text-slate-300" />
        <p className="max-w-xs text-sm text-slate-400">
          No documents yet. Add one to start building your knowledge base.
        </p>
        <Link href="/ingest">
          <Button variant="secondary" className="mt-1">
            <Plus size={15} strokeWidth={2.25} />
            Add a Document
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}

function DocumentCard({
  document,
  onDeleted,
}: {
  document: DocumentSummary;
  onDeleted: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function toggleExpanded() {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    if (fullContent === null) {
      setIsLoadingContent(true);
      try {
        const response = await fetch(`/api/documents/${document.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load document content.");
        }

        setFullContent((data as DocumentDetailResponse).content);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      } finally {
        setIsLoadingContent(false);
      }
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/documents/${document.id}`, { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete document.");
      }

      onDeleted(document.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FileText size={16} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{document.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} strokeWidth={2.25} />
                {dateFormatter.format(new Date(document.createdAt))}
              </span>
              <span className="flex items-center gap-1">
                <Layers size={12} strokeWidth={2.25} />
                {document.chunkCount} chunk{document.chunkCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isConfirmingDelete ? (
            <>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Confirm delete"}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Delete document"
            >
              <Trash2 size={15} strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={toggleExpanded}
        className="mt-3 flex w-full items-start justify-between gap-3 text-left"
      >
        <p className="text-sm leading-relaxed text-slate-500">
          {isExpanded && fullContent !== null ? fullContent : `${document.contentPreview}…`}
        </p>
        <ChevronDown
          size={16}
          strokeWidth={2.25}
          className={`mt-0.5 shrink-0 text-slate-300 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isLoadingContent && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <Loader2 size={13} strokeWidth={2.25} className="animate-spin" />
          Loading full content...
        </div>
      )}

      {errorMessage && (
        <div className="mt-3">
          <Alert variant="error">{errorMessage}</Alert>
        </div>
      )}
    </div>
  );
}
