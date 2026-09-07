"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`;
}

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (message) {
      setShow(true);
      const fadeTimer = setTimeout(() => {
        setShow(false);
      }, 2500); // Start fading out at 2.5 seconds
      const clearTimer = setTimeout(() => {
        setMessage(null);
      }, 2800); // Fully clear state at 2.8 seconds
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [message]);

  const handleSync = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initiatedBy: "admin"
        })
      });

      const payload = await response.json();

      if (!response.ok || payload.success === false) {
        throw new Error(payload.errorMessage ?? payload.error ?? "Sync failed");
      }

      setMessage({
        type: "success",
        text: "Sync completed"
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Sync failed"
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const syncDone = getCookie("gcam_sync_done");
    if (!syncDone) {
      setCookie("gcam_sync_done", "true");
      handleSync();
    }
  }, [handleSync]);

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-1.5"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Sync Now</span>
          </>
        )}
      </button>

      {message ? (
        <span
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap text-[12px] font-medium transition-opacity duration-300 ease-in-out ${
            show ? "opacity-100" : "opacity-0"
          } ${
            message.type === "success" ? "text-[#16A34A]" : "text-rose-600"
          }`}
        >
          {message.text}
        </span>
      ) : null}
    </div>
  );
}
