"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listResidents, type Resident } from "@/lib/api";

export default function DirectoryPage() {
  const { session, user, isLoading: authLoading } = useAuth();

  const [q, setQ] = useState("");
  const [unit, setUnit] = useState("");

  const [data, setData] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoad = !!session?.accessToken && !!user && !authLoading;

  const unitsInData = useMemo(() => {
    const set = new Set<string>();
    for (const r of data) {
      const u = (r.unit || "").trim();
      if (u) set.add(u);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  useEffect(() => {
    async function run() {
      if (!canLoad) return;
      setLoading(true);
      setError(null);
      try {
        const residents = await listResidents({
          accessToken: session!.accessToken,
          q: q.trim() || undefined,
          unit: unit.trim() || undefined,
        });
        setData(residents);
      } catch (e) {
        setData([]);
        setError(e instanceof Error ? e.message : "Failed to load residents.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [canLoad, q, unit, session]);

  return (
    <section className="retro-card" aria-label="Resident directory">
      <div className="retro-card-title">Directory</div>

      {!user ? (
        <div className="retro-card" style={{ boxShadow: "var(--shadow-hard-sm)" }}>
          <div className="retro-card-title">Welcome</div>
          <p className="retro-muted">
            Please <Link className="retro-link" href="/login">login</Link> to view the directory.
          </p>
        </div>
      ) : (
        <>
          <div className="retro-grid-2" aria-label="Search and filtering">
            <div className="retro-field">
              <label className="retro-label" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                className="retro-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, email, unit…"
              />
            </div>

            <div className="retro-field">
              <label className="retro-label" htmlFor="unit">
                Unit filter
              </label>
              <select
                id="unit"
                className="retro-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="">All units</option>
                {unitsInData.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <span className="retro-muted" style={{ fontSize: 12 }}>
                Tip: unit options populate after first load.
              </span>
            </div>
          </div>

          {error && (
            <div className="retro-card" role="alert" aria-live="polite" style={{ boxShadow: "var(--shadow-hard-sm)" }}>
              <div className="retro-card-title">Error</div>
              <p>{error}</p>
              <p className="retro-muted" style={{ marginTop: 6 }}>
                Backend endpoints expected: GET /residents?q=…&unit=…
              </p>
            </div>
          )}

          <div className="retro-card" style={{ boxShadow: "var(--shadow-hard-sm)" }}>
            <div className="retro-card-title">Residents</div>
            {loading ? (
              <p className="retro-muted" aria-busy="true">
                Loading…
              </p>
            ) : data.length === 0 ? (
              <p className="retro-muted">No residents found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="retro-table" aria-label="Residents list">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Unit</th>
                      <th>Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r) => (
                      <tr key={r.id}>
                        <td>{r.fullName}</td>
                        <td>{r.unit || <span className="retro-muted">—</span>}</td>
                        <td>
                          <Link className="retro-link" href={`/residents/${encodeURIComponent(r.id)}`}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
