import React, { Suspense } from "react";
import SignupClient from "./SignupClient";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <section className="retro-card" aria-busy="true">
          <div className="retro-card-title">Sign up</div>
          <p className="retro-muted">Loading…</p>
        </section>
      }
    >
      <SignupClient />
    </Suspense>
  );
}
