import type { Metadata } from "next";
import { Archivo_Black, Space_Mono, Inter } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RANKSTACK — Kinetic Orange CP Tracker",
  description: "Brutalist personal competitive programming dashboard aggregating Codeforces, LeetCode, CodeChef, and GeeksforGeeks into one unified streak.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${spaceMono.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink font-inter antialiased selection:bg-brand-orange selection:text-paper">
        {children}
      </body>
    </html>
  );
}
