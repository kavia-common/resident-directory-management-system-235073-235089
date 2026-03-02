"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getResident, type Resident } from "@/lib/api";
import { canViewResidentField } from "@/lib/privacy";

function FieldRow({
  label,
  value,
  visible,
}: {
  label: string;
  value: React.ReactNode;
  visible: boolean;
}) {
  return (
    <div className="retro-field">
      <div className="retro-label">{label}</div>
      {visible ? (
        <div>{value || <span className="retro-muted">—</span>}</div>
      ) : (
        <div className="retro-badge retro-badge-private">Private</div>
      )}
    </div>
  );
}

export default function ResidentProfileClient({
  residentId,
}: {
  residentId: string;
}) {
  const { session, user, isLoading: authLoading } = useAuth();

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoad = !!session?.accessToken && !!user && !authLoading;

  useEffect(() => {
    async function run() {
      if (!canLoad || !residentId) return;
      setLoading(true);
      setError(null);
      try {
        const r = await getResident({
          accessToken: session!.accessToken,
          residentId,
        });
        setResident(r);
      } catch (e) {
        setResident(null);
        setError(e instanceof Error ? e.message : "Failed to load resident.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [canLoad, session, residentId]);

  return (
    <section className="retro-card" aria-label="Resident profile">
      <div className="retro-card-title">Resident Profile</div>

      {!user ? (
        <p className="retro-muted">Please login to view resident profiles.</p>
      ) : loading ? (
        <p className="retro-muted" aria-busy="true">
          Loading…
        </p>
      ) : error ? (
        <div
          className="retro-card"
          role="alert"
          aria-live="polite"
          style={{ boxShadow: "var(--shadow-hard-sm)" }}
        >
          <div className="retro-card-title">Error</div>
          <p>{error}</p>
          <p className="retro-muted" style={{ marginTop: 6 }}>
            Backend endpoint expected: GET /residents/:id
          </p>
        </div>
      ) : !resident ? (
        <p className="retro-muted">Resident not found.</p>
      ) : (
        <>
          <div className="retro-card" style={{ boxShadow: "var(--shadow-hard-sm)" }}>
            <div className="retro-card-title" style={{ marginBottom: 6 }}>
              {resident.fullName}
            </div>
            <p className="retro-muted">
              Unit: {resident.unit || "—"} • ID: {resident.id}
            </p>
          </div>

          <div className="retro-grid-2" aria-label="Resident details">
            <FieldRow
              label="Email"
              value={resident.email}
              visible={canViewResidentField({
                viewer: user,
                resident,
                field: "email",
              })}
            />
            <FieldRow
              label="Phone"
              value={resident.phone}
              visible={canViewResidentField({
                viewer: user,
                resident,
                field: "phone",
              })}
            />
            <FieldRow
              label="Emergency contact"
              value={resident.emergencyContact}
              visible={canViewResidentField({
                viewer: user,
                resident,
                field: "emergencyContact",
              })}
            />
            <div className="retro-field">
              <div className="retro-label">Notes</div>
              <div>{resident.notes || <span className="retro-muted">—</span>}</div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
