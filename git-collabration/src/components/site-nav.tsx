"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/repositories", label: "Repositories" },
  { href: "/collaborators", label: "Collaborators" },
  { href: "/employees", label: "Employees" }
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 lg:justify-end">
      {navItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5",
              active
                ? "border-slate-950 bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
