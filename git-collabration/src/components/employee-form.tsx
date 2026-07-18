"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function EmployeeForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim()
    };

    setStatus(null);

    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      setStatus(result.error ?? "Unable to create employee.");
      return;
    }

    form.reset();
    setStatus("Employee created. Showing the full employee list.");
    router.replace("/employees");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="flex flex-col gap-5">
        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-semibold text-slate-700">Full Name</span>
          <input
            name="fullName"
            placeholder="e.g. John Doe"
            required
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-semibold text-slate-700">Email Address</span>
          <input
            name="email"
            type="email"
            placeholder="e.g. john@company.com"
            required
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          className="w-full flex h-10 items-center justify-center rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_12px_24px_rgba(15,23,42,0.18)] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Create Employee
        </button>
        {status ? <p className="text-xs font-semibold text-slate-600 text-center">{status}</p> : null}
      </div>
    </form>
  );
}
