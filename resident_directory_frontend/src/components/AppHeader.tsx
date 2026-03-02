"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "@/components/AuthProvider";

function RoleBadge({ role }: { role: string }) {
  return <span className="retro-badge">{role.toUpperCase()}</span>;
}

// PUBLIC_INTERFACE
export function AppHeader() {
  /** App top header with navigation, responsive wrapping, and auth actions. */
  const { user, signOut, isLoading } = useAuth();

  return (
    <header className="retro-header" role="banner">
      <div className="retro-brand" aria-label="Application identity">
        <div className="retro-brand-title">Resident Directory</div>
        <div className="retro-brand-subtitle">Retro UI • Privacy-aware • Role-based</div>
      </div>

      <nav className="retro-nav" aria-label="Primary navigation">
        <Link className="retro-link" href="/">
          Directory
        </Link>

        {user && (
          <Link className="retro-link" href="/profile">
            My Profile
          </Link>
        )}

        {user?.role === "admin" && (
          <Link className="retro-link" href="/admin/residents">
            Admin
          </Link>
        )}

        <span aria-hidden="true" className="retro-muted">
          |
        </span>

        {isLoading ? (
          <span className="retro-muted">Loading…</span>
        ) : user ? (
          <>
            <RoleBadge role={user.role} />
            <button className="retro-btn" type="button" onClick={signOut}>
              Logout
            </button>
          </>
        ) : (
          <Link className="retro-link" href="/login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
