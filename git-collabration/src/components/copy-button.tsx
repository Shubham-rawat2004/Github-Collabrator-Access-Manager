"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Remove leading @ if present
      const cleanText = text.startsWith("@") ? text.slice(1) : text;
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative flex items-center inline-flex">
      <button
        type="button"
        onClick={handleCopy}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-200"
        title="Copy username"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Back sheet */}
          <rect x="8" y="4" width="12" height="12" rx="1.5" ry="1.5" />
          {/* Front sheet with white fill to mask overlapping lines of the back sheet */}
          <rect x="4" y="8" width="12" height="12" rx="1.5" ry="1.5" fill="white" />
        </svg>
      </button>

      <span
        className={`absolute left-full ml-2 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md shadow-sm transition-all duration-200 whitespace-nowrap z-10 ${
          copied ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1 pointer-events-none"
        }`}
      >
        Copied!
      </span>
    </div>
  );
}
