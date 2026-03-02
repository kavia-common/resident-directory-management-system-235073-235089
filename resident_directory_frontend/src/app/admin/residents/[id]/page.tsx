import React from "react";
import AdminResidentEditClient from "./AdminResidentEditClient";

/**
 * PUBLIC_INTERFACE
 * Next.js static export hook.
 *
 * Because this app is configured with `output: "export"`, dynamic routes must define
 * `generateStaticParams`. We return an empty list here since resident IDs are data-driven
 * and provided by the backend at runtime.
 */
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  // Static export requires at least one param for dynamic routes.
  // We provide a placeholder path; real resident IDs are data-driven at runtime.
  return [{ id: "placeholder" }];
}

export default async function AdminResidentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  return <AdminResidentEditClient residentId={resolved.id} />;
}
