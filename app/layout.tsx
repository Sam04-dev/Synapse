import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jb-mono",
});

export const metadata: Metadata = {
  title: "Synapse — Memory Engine for AI Agents",
  description: "Stateful memory engine for autonomous AI agents. ACID-compliant state management with real-time visualization.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Synapse",
    description: "Stateful memory engine for autonomous AI agents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} font-mono antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
