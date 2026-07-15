"use client";

import { useState } from "react";
import { CalendarDays, Mail, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import type { Profile } from "@/types/auth";
import type { UpdateUserRoleResponse } from "@/types/api";

interface UserTableProps {
  initialUsers: Profile[];
  currentUserId: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function UserTable({ initialUsers, currentUserId }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function toggleRole(user: Profile) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    setPendingId(user.id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update role.");
      }

      const { user: updated } = data as UpdateUserRoleResponse;
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      {users.map((user) => {
        const isSelf = user.id === currentUserId;
        const isPending = pendingId === user.id;
        const isAdmin = user.role === "admin";

        return (
          <div
            key={user.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isAdmin ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Mail size={15} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                  {isSelf && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      You
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      isAdmin ? "text-brand-600" : "text-slate-400"
                    }`}
                  >
                    {isAdmin ? (
                      <ShieldCheck size={12} strokeWidth={2.25} />
                    ) : (
                      <ShieldOff size={12} strokeWidth={2.25} />
                    )}
                    {isAdmin ? "Admin" : "User"}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} strokeWidth={2.25} />
                    Joined {dateFormatter.format(new Date(user.createdAt))}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleRole(user)}
              disabled={isPending}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                isAdmin
                  ? "text-red-600 hover:bg-red-50"
                  : "text-brand-600 hover:bg-brand-50"
              }`}
            >
              {isPending && <Loader2 size={13} strokeWidth={2.25} className="animate-spin" />}
              {isPending ? "Updating..." : isAdmin ? "Revoke admin" : "Make admin"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
