"use client";

import React, { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import {
  adminUpdateResident,
  getResident,
  type Resident,
  type ResidentInput,
} from "@/lib/api";
import Link from "next/link";

function toInput(r: Resident): ResidentInput {
  return {
    fullName: r.fullName,
    unit: r.unit ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    emergencyContact: r.emergencyContact ?? "",
    hideEmail: !!r.hideEmail,
    hidePhone: !!r.hidePhone,
    hideEmergencyContact: !!r.hideEmergencyContact,
    notes: r.notes ?? "",
  };
}

export default function AdminResidentEditClient({
  residentId,
}: {
  residentId: string;
}) {
  const { session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [model, setModel] = useState<ResidentInput>({
    fullName: "",
    unit: "",
    email: "",
    phone: "",
    emergencyContact: "",
    hideEmail: false,
    hidePhone: false,
    hideEmergencyContact: false,
    notes: "",
  });

  useEffect(() => {
    async function run() {
      if (!session?.accessToken || !residentId) return;
      setLoading(true);
      setError(null);
      try {
        const r = await getResident({
          accessToken: session.accessToken,
          residentId,
        });
        setModel(toInput(r));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load resident.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [session?.accessToken, session, residentId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;

    if (!model.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await adminUpdateResident({
        accessToken: session.accessToken,
        residentId,
        input: {
          ...model,
          fullName: model.fullName.trim(),
          unit: model.unit?.trim() || "",
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth requireRole="admin">
      <section className="retro-card" aria-label="Admin edit resident">
        <div className="retro-card-title">Admin • Edit Resident</div>

        <div className="retro-nav" style={{ marginTop: 8 }}>
          <Link className="retro-link" href="/admin/residents">
            Back
          </Link>
          <Link
            className="retro-link"
            href={residentId ? `/residents/${encodeURIComponent(residentId)}` : "/admin/residents"}
          >
            View profile
          </Link>
        </div>

        {error && (
          <div
            className="retro-card"
            role="alert"
            aria-live="polite"
            style={{ marginTop: 12, boxShadow: "var(--shadow-hard-sm)" }}
          >
            <div className="retro-card-title">Error</div>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="retro-muted" aria-busy="true" style={{ marginTop: 12 }}>
            Loading…
          </p>
        ) : (
          <form onSubmit={onSave} className="retro-main" style={{ marginTop: 12 }}>
            <div className="retro-grid-2">
              <div className="retro-field">
                <label className="retro-label" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  className="retro-input"
                  value={model.fullName}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, fullName: e.target.value }))
                  }
                />
              </div>

              <div className="retro-field">
                <label className="retro-label" htmlFor="unit">
                  Unit
                </label>
                <input
                  id="unit"
                  className="retro-input"
                  value={model.unit || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, unit: e.target.value }))
                  }
                  placeholder="e.g., 12B"
                />
              </div>

              <div className="retro-field">
                <label className="retro-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="retro-input"
                  value={model.email || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, email: e.target.value }))
                  }
                />
              </div>

              <div className="retro-field">
                <label className="retro-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="retro-input"
                  value={model.phone || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, phone: e.target.value }))
                  }
                />
              </div>

              <div className="retro-field">
                <label className="retro-label" htmlFor="emergencyContact">
                  Emergency contact
                </label>
                <input
                  id="emergencyContact"
                  className="retro-input"
                  value={model.emergencyContact || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, emergencyContact: e.target.value }))
                  }
                />
              </div>

              <div className="retro-field">
                <label className="retro-label" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  className="retro-textarea"
                  value={model.notes || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="retro-card" style={{ boxShadow: "var(--shadow-hard-sm)" }}>
              <div className="retro-card-title">Privacy Controls</div>
              <p className="retro-muted" style={{ marginBottom: 10 }}>
                When enabled, these fields are hidden from other residents (admins always can view).
              </p>

              <div className="retro-grid-2">
                <label className="retro-field">
                  <span className="retro-label">Hide email</span>
                  <select
                    className="retro-select"
                    value={model.hideEmail ? "yes" : "no"}
                    onChange={(e) =>
                      setModel((m) => ({
                        ...m,
                        hideEmail: e.target.value === "yes",
                      }))
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>

                <label className="retro-field">
                  <span className="retro-label">Hide phone</span>
                  <select
                    className="retro-select"
                    value={model.hidePhone ? "yes" : "no"}
                    onChange={(e) =>
                      setModel((m) => ({
                        ...m,
                        hidePhone: e.target.value === "yes",
                      }))
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>

                <label className="retro-field">
                  <span className="retro-label">Hide emergency contact</span>
                  <select
                    className="retro-select"
                    value={model.hideEmergencyContact ? "yes" : "no"}
                    onChange={(e) =>
                      setModel((m) => ({
                        ...m,
                        hideEmergencyContact: e.target.value === "yes",
                      }))
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
              </div>
            </div>

            <button
              className="retro-btn retro-btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </section>
    </RequireAuth>
  );
}
