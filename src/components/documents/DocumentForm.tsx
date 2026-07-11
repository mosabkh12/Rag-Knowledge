"use client";

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";
import { Type, Upload, UploadCloud, FileText, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { CreateDocumentResponse } from "@/types/api";

type Status = "idle" | "loading" | "success" | "error";
type Mode = "paste" | "upload";

const ACCEPTED_FILE_EXTENSIONS = ".txt,.md,.markdown,.pdf,.docx";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentForm() {
  const [mode, setMode] = useState<Mode>("paste");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "loading";

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setStatus("idle");
    setMessage("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      let response: Response;

      if (mode === "upload") {
        if (!file) {
          throw new Error("Please choose a file to upload.");
        }

        const formData = new FormData();
        formData.append("file", file);
        if (title.trim().length > 0) {
          formData.append("title", title.trim());
        }

        response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add document.");
      }

      const result = data as CreateDocumentResponse;
      setStatus("success");
      setMessage(
        `Document saved successfully. ${result.chunksCreated} chunk(s) were created and embedded.`
      );
      setTitle("");
      setContent("");
      setFile(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7"
    >
      <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => switchMode("paste")}
          disabled={isLoading}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            mode === "paste"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Type size={14} strokeWidth={2.25} />
          Paste text
        </button>
        <button
          type="button"
          onClick={() => switchMode("upload")}
          disabled={isLoading}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload size={14} strokeWidth={2.25} />
          Upload file
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Title
          {mode === "upload" && (
            <span className="ml-1.5 font-normal text-slate-400">
              (optional — defaults to filename)
            </span>
          )}
        </label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Employee Onboarding Guide"
          maxLength={120}
          required={mode === "paste"}
          disabled={isLoading}
        />
      </div>

      {mode === "paste" ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="content" className="text-sm font-medium text-slate-700">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste the document text here (minimum 50 characters)..."
            rows={12}
            required
            disabled={isLoading}
          />
          <span className="text-xs text-slate-400">{content.length} characters</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">File</span>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragActive
                ? "border-brand-400 bg-brand-50"
                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/60"
            }`}
          >
            <UploadCloud
              size={28}
              strokeWidth={1.75}
              className={isDragActive ? "text-brand-500" : "text-slate-400"}
            />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-brand-600">Click to upload</span> or
              drag and drop
            </p>
            <p className="text-xs text-slate-400">
              .txt, .md, .pdf, .docx — max 15MB
            </p>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept={ACCEPTED_FILE_EXTENSIONS}
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText size={16} strokeWidth={2} className="shrink-0 text-brand-600" />
                <span className="truncate text-sm text-slate-700">{file.name}</span>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={isLoading}
                className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Remove file"
              >
                <X size={15} strokeWidth={2.25} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-slate-100 pt-5">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Document"}
        </Button>
        {isLoading && (
          <LoadingSpinner
            label={
              mode === "upload"
                ? "Extracting text, chunking, and embedding document..."
                : "Chunking and embedding document..."
            }
          />
        )}
      </div>

      {status === "success" && <Alert variant="success">{message}</Alert>}
      {status === "error" && <Alert variant="error">{message}</Alert>}
    </form>
  );
}
