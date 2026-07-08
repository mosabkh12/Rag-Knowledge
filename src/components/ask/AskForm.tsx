"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AnswerPanel from "./AnswerPanel";
import type { AskResponse } from "@/types/api";

type Status = "idle" | "loading" | "success" | "error";

export default function AskForm() {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to get an answer.");
      }

      setResult(data as AskResponse);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="question" className="text-sm font-medium text-slate-700">
            Your question
          </label>
          <Textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a question about your uploaded documents..."
            rows={3}
            maxLength={500}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Thinking..." : "Ask"}
          </Button>
          {isLoading && <LoadingSpinner label="Retrieving context and generating answer..." />}
        </div>

        {status === "error" && <Alert variant="error">{errorMessage}</Alert>}
      </form>

      {status === "success" && result && <AnswerPanel result={result} />}

      {status === "idle" && (
        <p className="text-sm text-slate-400">
          Ask a question above to see a grounded answer with source citations.
        </p>
      )}
    </div>
  );
}
