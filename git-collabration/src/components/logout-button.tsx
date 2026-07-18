"use client";

import { useState } from "react";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/api/auth/logout"
      method="post"
      onSubmit={() => {
        setPending(true);
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 ease-in-out hover:border-[#DC2626] hover:bg-[#DC2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing out..." : "Logout"}
      </button>
    </form>
  );
}
