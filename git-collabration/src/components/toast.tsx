"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    const showTimer = setTimeout(() => setVisible(true), 10);

    // Trigger slide-out / close action
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      const closeTimer = setTimeout(onClose, 200); // Wait for transition out
      return () => clearTimeout(closeTimer);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[9999] pointer-events-none">
      <div
        role="alert"
        className={clsx(
          "pointer-events-auto flex items-center gap-2.5 rounded-[12px] border px-4 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out transform",
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95",
          type === "success"
            ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
            : "bg-red-50 border-red-200 text-red-800"
        )}
      >
        {type === "success" ? (
          <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        <span className="text-xs font-semibold tracking-wide">{message}</span>
      </div>
    </div>
  );
}
