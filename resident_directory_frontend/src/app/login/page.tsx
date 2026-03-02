import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="retro-card" aria-busy="true">
          <div className="retro-card-title">Login</div>
          <p className="retro-muted">Loading…</p>
        </section>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
