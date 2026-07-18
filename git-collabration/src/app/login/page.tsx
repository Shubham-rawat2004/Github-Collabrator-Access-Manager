import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

function FieldIcon({ type }: { type: "user" | "lock" }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
      {type === "user" ? (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
          <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10.5V8a4 4 0 118 0v2.5" />
        </svg>
      )}
    </span>
  );
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ from?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const params = await searchParams;
  const from = params?.from ?? "/";
  const showInvalidCredentials = params?.error === "invalid";

  return (
    <main className="relative min-h-screen bg-[#F5F5F4] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,#F5F5F4_100%)] px-4 py-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[430px] relative z-10 animate-fade-in">
        <form
          action="/api/auth/login"
          method="post"
          className="relative w-full rounded-[20px] border border-[#E5E7EB] bg-white p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300"
        >
          <p className="text-[10px] font-bold uppercase tracking-[4px] text-[#6B7280]">
            GitHub Collaborator Access Manager
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111111]">
            Admin Login
          </h1>
          <input type="hidden" name="from" value={from} />
          {showInvalidCredentials ? (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm text-center"
            >
              Incorrect username or password. Please try again.
            </div>
          ) : null}
          <div className="mt-8 grid gap-4 text-left">
            <label className="relative block">
              <span className="sr-only">Username</span>
              <FieldIcon type="user" />
              <input
                name="username"
                placeholder="Username"
                autoComplete="username"
                className="h-[52px] w-full rounded-[12px] border border-[#D4D4D8] bg-[#FAFAFA] pl-12 pr-4 text-sm text-[#111111] placeholder-[#9CA3AF] outline-none transition-all duration-200 hover:border-zinc-400 focus:border-[#111111] focus:bg-white focus:ring-4 focus:ring-[#111111]/5 focus-visible:outline-none"
              />
            </label>
            <label className="relative block">
              <span className="sr-only">Password</span>
              <FieldIcon type="lock" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                className="h-[52px] w-full rounded-[12px] border border-[#D4D4D8] bg-[#FAFAFA] pl-12 pr-4 text-sm text-[#111111] placeholder-[#9CA3AF] outline-none transition-all duration-200 hover:border-zinc-400 focus:border-[#111111] focus:bg-white focus:ring-4 focus:ring-[#111111]/5 focus-visible:outline-none"
              />
            </label>
            <button
              type="submit"
              className="mt-2 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#111111] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#2B2B2B] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[#111111]/10"
            >
              Admin Login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
