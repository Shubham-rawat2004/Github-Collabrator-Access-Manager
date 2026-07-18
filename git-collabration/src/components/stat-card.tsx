import Link from "next/link";

export function StatCard({
  label,
  value,
  subtext,
  href
}: {
  label: string;
  value: string | number;
  subtext?: string;
  href?: string;
}) {
  const card = (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.04)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:bg-slate-50/50 hover:shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
      <p className="text-xs uppercase tracking-[0.32em] text-slate-400 font-semibold">{label}</p>
      <p className="mt-4 text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {subtext ? <p className="mt-4 text-xs font-medium text-slate-400 max-w-[200px] leading-relaxed">{subtext}</p> : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block cursor-pointer">
      {card}
    </Link>
  ) : (
    card
  );
}
