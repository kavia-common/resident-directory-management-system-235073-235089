"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login, type Session, type SessionUser } from "@/lib/api";

type AuthContextValue = {
  session: Session | null;
  user: SessionUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "resident_directory_session";

/**
 * INTERNAL: safe localStorage read for client-side.
 */
function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/**
 * INTERNAL: safe localStorage write for client-side.
 */
function writeStoredSession(session: Session | null) {
  try {
    if (!session) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /** Provides app-wide session state and login/logout methods. */
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hydrateFromStorage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const stored = readStoredSession();
    if (!stored?.accessToken) {
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await getMe(stored.accessToken);
      const nextSession: Session = { ...stored, user: me };
      setSession(nextSession);
      setUser(me);
      writeStoredSession(nextSession);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to restore session.";
      setError(msg);
      setSession(null);
      setUser(null);
      writeStoredSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await login(email, password);
      setSession(newSession);
      setUser(newSession.user);
      writeStoredSession(newSession);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed.";
      setError(msg);
      setSession(null);
      setUser(null);
      writeStoredSession(null);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setUser(null);
    setError(null);
    writeStoredSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      error,
      signIn,
      signOut,
    }),
    [session, user, isLoading, error, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /** Hook to access session state and auth actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
