"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useDialog } from "@/components/dialog-provider";

type Collaborator = {
  id: string; // githubUser.id
  githubUsername: string;
  employeeName: string | null;
};

export function RepositoryCollaboratorsList({
  repositoryId,
  collaborators,
  hasAdminPermission,
  adminUsername
}: {
  repositoryId: string;
  collaborators: Collaborator[];
  hasAdminPermission: boolean;
  adminUsername: string | null;
}) {
  const router = useRouter();
  const dialog = useDialog();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectableCollaborators = useMemo(() => {
    return collaborators.filter(
      (c) => c.githubUsername.toLowerCase() !== adminUsername?.toLowerCase()
    );
  }, [collaborators, adminUsername]);

  const allSelected = useMemo(() => {
    return (
      selectableCollaborators.length > 0 &&
      selectableCollaborators.every((c) => selectedIds.includes(c.id))
    );
  }, [selectableCollaborators, selectedIds]);

  function handleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableCollaborators.map((c) => c.id));
    }
  }

  function handleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleRemove() {
    if (selectedIds.length === 0) return;
    const isConfirmed = await dialog.confirm({
      title: "Remove Collaborators?",
      message: `Are you sure you want to remove the ${selectedIds.length} selected collaborator(s) from this repository?`,
      confirmText: "Remove selected",
      cancelText: "Cancel",
      isDestructive: true
    });

    if (!isConfirmed) {
      return;
    }

    setIsRemoving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/repositories/remove-collaborators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          repositoryId,
          githubUserIds: selectedIds
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to remove collaborators.");
      }

      setMessage({ type: "success", text: `Successfully removed ${data.result.removed} collaborator(s).` });
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred during removal."
      });
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div
          role="alert"
          className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm flex items-start gap-2.5 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      ) : null}

      {!hasAdminPermission && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs font-medium text-amber-850 flex items-center gap-2">
          <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Only repository administrators can remove collaborators. Some actions are disabled.</span>
        </div>
      )}

      {collaborators.length === 0 ? (
        <p className="text-sm text-slate-500">No collaborators recorded for this repository.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <label
              title={
                !hasAdminPermission
                  ? "Only repository administrators can remove collaborators."
                  : selectableCollaborators.length === 0
                  ? "No other collaborators to select."
                  : undefined
              }
              className={`flex items-center gap-3 text-sm font-semibold text-slate-800 select-none ${
                !hasAdminPermission || selectableCollaborators.length === 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                disabled={!hasAdminPermission || selectableCollaborators.length === 0}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span>Select All</span>
            </label>

            <button
              onClick={handleRemove}
              disabled={selectedIds.length === 0 || isRemoving || !hasAdminPermission}
              className="rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200"
            >
              {isRemoving ? "Removing..." : `Remove Selected (${selectedIds.length})`}
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {collaborators.map((c) => {
              const isAdminSelf = c.githubUsername.toLowerCase() === adminUsername?.toLowerCase();
              const isRowDisabled = !hasAdminPermission || isAdminSelf;
              const tooltipText = !hasAdminPermission
                ? "Only repository administrators can remove collaborators."
                : isAdminSelf
                ? "Repository administrators cannot be removed."
                : undefined;

              return (
                <label
                  key={c.id}
                  title={tooltipText}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition-all duration-150 select-none ${
                    isRowDisabled
                      ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                      : selectedIds.includes(c.id)
                      ? "border-rose-200 bg-rose-50/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleSelectOne(c.id)}
                      disabled={isRowDisabled}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div>
                      <span className="font-semibold text-slate-900">@{c.githubUsername}</span>
                      {c.employeeName ? (
                        <span className="ml-2 text-xs text-slate-500 font-medium">({c.employeeName})</span>
                      ) : null}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
