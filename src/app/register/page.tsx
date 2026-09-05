"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, User, Mail, Lock, Phone, Github, Trophy, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

type Field = {
  name: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  type?: string;
  hint?: string;
};

const PERSONAL_FIELDS: Field[] = [
  { name: "name", label: "Full Name", placeholder: "e.g. Alex Smith", icon: <User className="w-4 h-4" />, required: true },
  { name: "email", label: "Email Address", placeholder: "you@example.com", icon: <Mail className="w-4 h-4" />, required: true, type: "email" },
  { name: "password", label: "Password", placeholder: "Min. 8 characters", icon: <Lock className="w-4 h-4" />, required: true, type: "password" },
  { name: "phone", label: "Phone (optional)", placeholder: "+91 98765 43210", icon: <Phone className="w-4 h-4" />, type: "tel" },
];

const PLATFORM_FIELDS: Field[] = [
  { name: "lc_handle", label: "LeetCode Username", placeholder: "your_leetcode_id", icon: <Trophy className="w-4 h-4" />, hint: "leetcode.com/u/YOUR_HANDLE" },
  { name: "cc_handle1", label: "CodeChef Account 1", placeholder: "your_codechef_id", icon: <Trophy className="w-4 h-4" />, hint: "codechef.com/users/YOUR_HANDLE" },
  { name: "cc_handle2", label: "CodeChef Account 2 (optional)", placeholder: "college_or_alt_id", icon: <Trophy className="w-4 h-4" />, hint: "Second CodeChef account (if any)" },
  { name: "gfg_handle", label: "GeeksforGeeks Username", placeholder: "your_gfg_id", icon: <Trophy className="w-4 h-4" />, hint: "auth.geeksforgeeks.org/user/YOUR_HANDLE" },
  { name: "cf_handle", label: "Codeforces Handle (optional)", placeholder: "your_codeforces_id", icon: <Trophy className="w-4 h-4" />, hint: "codeforces.com/profile/YOUR_HANDLE" },
  { name: "github_handle", label: "GitHub Username", placeholder: "your_github_username", icon: <Github className="w-4 h-4" />, hint: "github.com/YOUR_HANDLE" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-[#FF4D00] mx-auto mb-4 animate-bounce" />
          <p className="text-white font-mono text-xl uppercase tracking-widest">Account created! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#FF4D00 1px,transparent 1px),linear-gradient(90deg,#FF4D00 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-8 h-8 bg-[#FF4D00] flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-black tracking-widest uppercase text-white group-hover:text-[#FF4D00] transition-colors">RankStack</span>
        </Link>

        <div className="w-full max-w-2xl">
          <div className="border-2 border-[#222] bg-[#0a0a0a]">
            {/* Header */}
            <div className="border-b-2 border-[#222] p-6">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">Create Your Account</h1>
              <p className="text-[#555] text-sm mt-1 uppercase tracking-wider">Track every platform. Miss no contest. Break no streak.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* ── Personal Info ─────────────────────────────────── */}
              <div>
                <p className="text-[10px] text-[#FF4D00] font-black uppercase tracking-[3px] mb-4">Personal Info</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERSONAL_FIELDS.map((f) => (
                    <div key={f.name} className={f.name === "name" || f.name === "email" ? "md:col-span-1" : ""}>
                      <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5">
                        {f.label} {f.required && <span className="text-[#FF4D00]">*</span>}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]">{f.icon}</span>
                        <input
                          type={f.type || "text"}
                          placeholder={f.placeholder}
                          required={f.required}
                          value={form[f.name] || ""}
                          onChange={(e) => set(f.name, e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#222] text-white placeholder-[#333] pl-10 pr-4 py-3 text-sm focus:border-[#FF4D00] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Platform Handles ──────────────────────────────── */}
              <div>
                <p className="text-[10px] text-[#FF4D00] font-black uppercase tracking-[3px] mb-1">Platform Handles</p>
                <p className="text-[10px] text-[#444] uppercase tracking-wider mb-4">At least one is required</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLATFORM_FIELDS.map((f) => (
                    <div key={f.name}>
                      <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5">{f.label}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]">{f.icon}</span>
                        <input
                          type="text"
                          placeholder={f.placeholder}
                          value={form[f.name] || ""}
                          onChange={(e) => set(f.name, e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#222] text-white placeholder-[#333] pl-10 pr-4 py-3 text-sm focus:border-[#FF4D00] focus:outline-none transition-colors"
                        />
                      </div>
                      {f.hint && <p className="text-[10px] text-[#333] mt-1 pl-1">{f.hint}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Error ─────────────────────────────────────────── */}
              {error && (
                <div className="flex items-center gap-3 bg-red-950/50 border-2 border-red-800 p-4 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Submit ────────────────────────────────────────── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF4D00] text-black font-black text-sm uppercase tracking-widest py-4 hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                ) : (
                  "Create Account & Start Tracking →"
                )}
              </button>

              <p className="text-center text-[#444] text-xs uppercase tracking-widest">
                Already have an account?{" "}
                <Link href="/login" className="text-[#FF4D00] hover:text-white transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
