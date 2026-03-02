"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import {
  adminCreateResident,
  adminDeleteResident,
  listResidents,
  type Resident,
} from "@/lib/api";

export default function AdminResidentsPage() {
  const { session } = useAuth();

  const [data, setData] = useState<Resident[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const residents = await listResidents({
        accessToken: session.accessToken,
        q: q.trim() || undefined,
      });
      setData(residents);
    } catch (e) {
      setData([]);
      setError(e instanceof Error ? e.message : "Failed to load residents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, q]);

  async function onCreate() {
    if (!session?.accessToken) return;
    setMutating(true);
    setError(null);
    try {
      await adminCreateResident({
        accessToken: session.accessToken,
        input: {
          fullName: "New Resident",
          unit: "",
          email: "",
          phone: "",
          emergencyContact: "",
          hideEmail: false,
          hidePhone: false,
          hideEmergencyContact: false,
          notes: "",
        },
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed.");
    } finally {
      setMutating(false);
    }
  }

  async function onDelete(residentId: string) {
    if (!session?.accessToken) return;
    const ok = confirm("Delete this resident? This cannot be undone.");
    if (!ok) return;

    setMutating(true);
    setError(null);
    try {
      await adminDeleteResident({ accessToken: session.accessToken, residentId });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setMutating(false);
    }
  }

  return (
    <RequireAuth requireRole="admin">
      <section className="retro-card" aria-label="Admin residents">
        <div className="retro-card-title">Admin • Residents</div>
        <p className="retro-muted">
          Admin-only CRUD tools. Expected backend endpoints: /admin/residents and /admin/residents/:id
        </p>

        <div className="retro-grid-2" style={{ marginTop: 12 }}>
          <div className="retro-field">
            <label className="retro-label" htmlFor="admin-q">
              Search
            </label>
            <input
              id="admin-q"
              className="retro-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name/unit…"
            />
          </div>

          <div className="retro-field" style={{ justifyContent: "flex-end" }}>
            <span className="retro-muted" style={{ fontSize: 12 }}>
              Quick actions
            </span>
            <button
              className="retro-btn retro-btn-primary"
              type="button"
              onClick={onCreate}
              disabled={mutating}
            >
              {mutating ? "Working…" : "Create resident"}
            </button>
          </div>
        </div>

        {error && (
          <div className="retro-card" role="alert" aria-live="polite" style={{ marginTop: 12, boxShadow: "var(--shadow-hard-sm)" }}>
            <div className="retro-card-title">Error</div>
            <p>{error}</p>
          </div>
        )}

        <div className="retro-card" style={{ marginTop: 12, boxShadow: "var(--shadow-hard-sm)" }}>
          <div className="retro-card-title">Resident Records</div>

          {loading ? (
            <p className="retro-muted" aria-busy="true">
              Loading…
            </p>
          ) : data.length === 0 ? (
            <p className="retro-muted">No residents.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="retro-table" aria-label="Admin residents table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Unit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.id}>
                      <td>{r.fullName}</td>
                      <td>{r.unit || <span className="retro-muted">—</span>}</td>
                      <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link className="retro-link" href={`/admin/residents/${encodeURIComponent(r.id)}`}>
                          Edit
                        </Link>
                        <button
                          className="retro-btn retro-btn-danger"
                          type="button"
                          onClick={() => onDelete(r.id)}
                          disabled={mutating}
                        >
                          Delete
                        </button>
                        <Link className="retro-link" href={`/residents/${encodeURIComponent(r.id)}`}>
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </RequireAuth>
  );
}
