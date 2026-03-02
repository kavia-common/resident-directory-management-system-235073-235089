"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const { signIn, error, isLoading, user } = useAuth();
  const router = useRouter();
  const search = useSearchParams();

  const nextPath = useMemo(() => search.get("next") || "/", [search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState<string | null>(null);

  if (user) {
    router.replace(nextPath);
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !email.includes("@")) {
      setLocalError("Please enter a valid email.");
      return;
    }
    if (password.length < 4) {
      setLocalError("Password must be at least 4 characters.");
      return;
    }

    try {
      await signIn(email.trim(), password);
      router.replace(nextPath);
    } catch {
      // error is surfaced via provider
    }
  }

  return (
    <section className="retro-card" aria-label="Login">
      <div className="retro-card-title">Login</div>
      <p className="retro-muted">
        Sign in to view the resident directory. Admin users will see additional tools.
      </p>

      <form onSubmit={onSubmit} className="retro-main" style={{ marginTop: 12 }}>
        <div className="retro-grid-2">
          <div className="retro-field">
            <label className="retro-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="retro-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="retro-field">
            <label className="retro-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="retro-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••"
            />
          </div>
        </div>

        {(localError || error) && (
          <div
            className="retro-card"
            role="alert"
            aria-live="polite"
            style={{ boxShadow: "var(--shadow-hard-sm)" }}
          >
            <div className="retro-card-title" style={{ marginBottom: 6 }}>
              Problem
            </div>
            <p>{localError || error}</p>
            <p className="retro-muted" style={{ marginTop: 6 }}>
              Note: backend auth endpoints must exist (e.g., /auth/login and /auth/me).
            </p>
          </div>
        )}

        <button className="retro-btn retro-btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
