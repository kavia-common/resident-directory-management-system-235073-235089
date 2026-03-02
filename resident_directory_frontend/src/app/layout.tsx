import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Resident Directory",
  description: "Retro-themed resident directory with privacy-aware profiles and admin tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="retro-scanlines" suppressHydrationWarning>
        <AuthProvider>
          <div className="retro-container">
            <AppHeader />
            <main className="retro-main">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
