"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="border-2 border-[#222] bg-[#0a0a0a]">
        {/* Header */}
        <div className="border-b-2 border-[#222] p-6">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Sign In</h1>
          <p className="text-[#555] text-sm mt-1 uppercase tracking-wider">Your streak is waiting.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5">
              Email <span className="text-[#FF4D00]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input
                type="email"
                placeholder="you@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border-2 border-[#222] text-white placeholder-[#333] pl-10 pr-4 py-3 text-sm focus:border-[#FF4D00] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5">
              Password <span className="text-[#FF4D00]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input
                type="password"
                placeholder="Your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border-2 border-[#222] text-white placeholder-[#333] pl-10 pr-4 py-3 text-sm focus:border-[#FF4D00] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-950/50 border-2 border-red-800 p-4 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF4D00] text-black font-black text-sm uppercase tracking-widest py-4 hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing In...</>
            ) : (
              "Sign In →"
            )}
          </button>

          <p className="text-center text-[#444] text-xs uppercase tracking-widest pt-2">
            New here?{" "}
            <Link href="/register" className="text-[#FF4D00] hover:text-white transition-colors">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#FF4D00 1px,transparent 1px),linear-gradient(90deg,#FF4D00 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-8 h-8 bg-[#FF4D00] flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-black tracking-widest uppercase text-white group-hover:text-[#FF4D00] transition-colors">RankStack</span>
        </Link>

        <Suspense fallback={<div className="text-gray-500 text-xs">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
