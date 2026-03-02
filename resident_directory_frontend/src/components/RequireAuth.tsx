"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/api";

// PUBLIC_INTERFACE
export function RequireAuth({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: UserRole;
}) {
  /** Redirects unauthenticated users to /login and optionally enforces a required role. */
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requireRole && user.role !== requireRole) {
      router.replace("/");
    }
  }, [user, isLoading, router, requireRole]);

  if (isLoading) {
    return (
      <section className="retro-card" aria-busy="true">
        <div className="retro-card-title">Loading</div>
        <p className="retro-muted">Checking session…</p>
      </section>
    );
  }

  if (!user) return null;
  if (requireRole && user.role !== requireRole) return null;

  return <>{children}</>;
}
