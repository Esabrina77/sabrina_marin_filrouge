import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/auth/AuthInitializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Accès Administrateur — Fika Dashboard",
  description: "Tableau de bord de gestion Fika Restaurant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-fika-primary/20 selection:text-fika-primary`} suppressHydrationWarning>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </body>
    </html>
  );
}
