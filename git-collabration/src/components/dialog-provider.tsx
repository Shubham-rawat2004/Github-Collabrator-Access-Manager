"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import clsx from "clsx";

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface AlertOptions {
  title?: string;
  message: string;
  okText?: string;
  type?: "success" | "error" | "info";
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    isAnimating: boolean;
    type: "confirm" | "alert";
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    alertType?: "success" | "error" | "info";
    resolve?: (value: any) => void;
  } | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close/cancel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!dialogState || !dialogState.isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogState]);

  // Prevent scroll when dialog is open
  useEffect(() => {
    if (dialogState?.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [dialogState?.isOpen]);

  const confirm = (options: DialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        isAnimating: false,
        type: "confirm",
        title: options.title ?? "Are you sure?",
        message: options.message,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        isDestructive: options.isDestructive ?? true,
        resolve,
      });

      // Animate entry after a tick
      setTimeout(() => {
        setDialogState((prev) => prev ? { ...prev, isAnimating: true } : null);
      }, 20);
    });
  };

  const alert = (options: AlertOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      setDialogState({
        isOpen: true,
        isAnimating: false,
        type: "alert",
        title: options.title ?? (options.type === "error" ? "Error" : options.type === "success" ? "Success" : "Notification"),
        message: options.message,
        confirmText: options.okText ?? "OK",
        alertType: options.type ?? "info",
        resolve: () => resolve(),
      });

      // Animate entry after a tick
      setTimeout(() => {
        setDialogState((prev) => prev ? { ...prev, isAnimating: true } : null);
      }, 20);
    });
  };

  const handleConfirm = () => {
    if (!dialogState || !dialogState.resolve) return;
    const resolve = dialogState.resolve;

    // Trigger exit animation
    setDialogState((prev) => prev ? { ...prev, isAnimating: false } : null);

    setTimeout(() => {
      setDialogState(null);
      resolve(true);
    }, 200);
  };

  const handleCancel = () => {
    if (!dialogState || !dialogState.resolve) return;
    const resolve = dialogState.resolve;

    // Trigger exit animation
    setDialogState((prev) => prev ? { ...prev, isAnimating: false } : null);

    setTimeout(() => {
      setDialogState(null);
      resolve(false);
    }, 200);
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialogState?.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            onClick={dialogState.type === "confirm" ? handleCancel : handleConfirm}
            className={clsx(
              "absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ease-out",
              dialogState.isAnimating ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Modal Container */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            className={clsx(
              "relative w-full max-w-md transform overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.15)] transition-all duration-300 ease-out md:p-8",
              dialogState.isAnimating
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95"
            )}
          >
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              {/* Icon */}
              <div
                className={clsx(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl mb-4 sm:mb-5",
                  dialogState.type === "confirm"
                    ? dialogState.isDestructive
                      ? "bg-rose-50 text-rose-600"
                      : "bg-amber-50 text-amber-600"
                    : dialogState.alertType === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : dialogState.alertType === "error"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-blue-50 text-blue-600"
                )}
              >
                {dialogState.type === "confirm" ? (
                  dialogState.isDestructive ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )
                ) : dialogState.alertType === "success" ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : dialogState.alertType === "error" ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Title & Message */}
              <div className="w-full">
                <h3 className="text-lg font-bold text-slate-900 leading-6">
                  {dialogState.title}
                </h3>
                <div className="mt-2.5">
                  <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                    {dialogState.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:mt-8 sm:flex-row sm:justify-end">
              {dialogState.type === "confirm" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition duration-150 sm:w-auto"
                >
                  {dialogState.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className={clsx(
                  "inline-flex w-full items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 sm:w-auto",
                  dialogState.type === "confirm" && dialogState.isDestructive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : dialogState.alertType === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : dialogState.alertType === "error"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-slate-900 hover:bg-slate-800"
                )}
              >
                {dialogState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
