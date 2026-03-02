import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="retro-card" role="alert" aria-live="assertive">
      <div className="retro-card-title">404 — Not Found</div>
      <p className="retro-muted">
        The page you’re looking for doesn’t exist.
      </p>
      <div className="retro-nav" style={{ marginTop: 12 }}>
        <Link className="retro-link" href="/">
          Go to Directory
        </Link>
      </div>
    </section>
  );
}
