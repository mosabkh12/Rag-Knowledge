"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { CreateDocumentResponse } from "@/types/api";

type Status = "idle" | "loading" | "success" | "error";

export default function DocumentForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

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
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Employee Onboarding Guide"
          maxLength={120}
          required
          disabled={isLoading}
        />
      </div>

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

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Document"}
        </Button>
        {isLoading && <LoadingSpinner label="Chunking and embedding document..." />}
      </div>

      {status === "success" && <Alert variant="success">{message}</Alert>}
      {status === "error" && <Alert variant="error">{message}</Alert>}
    </form>
  );
}
