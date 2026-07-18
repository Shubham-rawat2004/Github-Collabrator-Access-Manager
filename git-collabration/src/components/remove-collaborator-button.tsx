"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDialog } from "@/components/dialog-provider";

export function RemoveCollaboratorButton({
  githubUserId,
  githubUsername
}: {
  githubUserId: string;
  githubUsername: string;
}) {
  const router = useRouter();
  const dialog = useDialog();
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    const isConfirmed = await dialog.confirm({
      title: "Remove Collaborator?",
      message: `Are you sure you want to remove @${githubUsername} from ALL repositories? This action will contact GitHub APIs to revoke access.`,
      confirmText: "Remove from all",
      cancelText: "Cancel",
      isDestructive: true
    });

    if (!isConfirmed) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch("/api/collaborators/remove-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          githubUserId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to remove collaborator.");
      }

      await dialog.alert({
        title: "Collaborator Removed",
        message: `Successfully removed @${githubUsername} from all repositories.`,
        type: "success"
      });
      router.refresh();
    } catch (error) {
      await dialog.alert({
        title: "Removal Failed",
        message: error instanceof Error ? error.message : "An error occurred during removal.",
        type: "error"
      });
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className="inline-flex h-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
    >
      {isRemoving ? "Removing..." : "Remove from all repos"}
    </button>
  );
}
