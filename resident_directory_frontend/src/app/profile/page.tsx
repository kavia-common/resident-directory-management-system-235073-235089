"use client";

import React, { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { getResident, type Resident } from "@/lib/api";
import { canViewResidentField } from "@/lib/privacy";

export default function MyProfilePage() {
  const { session, user } = useAuth();
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!session?.accessToken || !user) return;
      setLoading(true);
      setError(null);
      try {
        const r = await getResident({
          accessToken: session.accessToken,
          residentId: user.id,
        });
        setResident(r);
      } catch (e) {
        setResident(null);
        setError(e instanceof Error ? e.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [session, user]);

  return (
    <RequireAuth>
      <section className="retro-card" aria-label="My profile">
        <div className="retro-card-title">My Profile</div>

        {loading ? (
          <p className="retro-muted" aria-busy="true">
            Loading…
          </p>
        ) : error ? (
          <div className="retro-card" role="alert" aria-live="polite" style={{ boxShadow: "var(--shadow-hard-sm)" }}>
            <div className="retro-card-title">Error</div>
            <p>{error}</p>
          </div>
        ) : !resident || !user ? (
          <p className="retro-muted">No profile data available.</p>
        ) : (
          <div className="retro-grid-2">
            <div className="retro-field">
              <div className="retro-label">Name</div>
              <div>{resident.fullName}</div>
            </div>
            <div className="retro-field">
              <div className="retro-label">Unit</div>
              <div>{resident.unit || <span className="retro-muted">—</span>}</div>
            </div>

            <div className="retro-field">
              <div className="retro-label">Email</div>
              <div>
                {canViewResidentField({ viewer: user, resident, field: "email" }) ? (
                  resident.email || <span className="retro-muted">—</span>
                ) : (
                  <span className="retro-badge retro-badge-private">Private</span>
                )}
              </div>
            </div>

            <div className="retro-field">
              <div className="retro-label">Phone</div>
              <div>
                {canViewResidentField({ viewer: user, resident, field: "phone" }) ? (
                  resident.phone || <span className="retro-muted">—</span>
                ) : (
                  <span className="retro-badge retro-badge-private">Private</span>
                )}
              </div>
            </div>

            <div className="retro-field">
              <div className="retro-label">Emergency contact</div>
              <div>
                {canViewResidentField({ viewer: user, resident, field: "emergencyContact" }) ? (
                  resident.emergencyContact || <span className="retro-muted">—</span>
                ) : (
                  <span className="retro-badge retro-badge-private">Private</span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
