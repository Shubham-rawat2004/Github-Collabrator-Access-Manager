"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";

export function MappingFocusSection({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    function focusMapping() {
      if (window.location.hash !== "#mapping") {
        return;
      }

      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlight(true);

      window.setTimeout(() => {
        setHighlight(false);
      }, 1800);
    }

    focusMapping();
    window.addEventListener("hashchange", focusMapping);

    return () => {
      window.removeEventListener("hashchange", focusMapping);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="mapping"
      className={clsx(
        "scroll-mt-24 flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-500",
        highlight && "ring-2 ring-slate-300 ring-offset-2 ring-offset-white"
      )}
    >
      {children}
    </section>
  );
}
