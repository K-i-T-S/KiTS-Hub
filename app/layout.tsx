import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingHelpBubble from "@/components/floating-help-bubble";
import FloatingCloud from "@/components/floating-cloud";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KiTS Hub - Complete Business Management Platform",
  description: "The all-in-one business management platform combining CRM, POS, inventory, HR, accounting, and more. Everything your business needs to thrive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.botpress.cloud/webchat/v3.5/inject.js"></script>
        <script src="https://files.bpcontent.cloud/2026/01/02/09/20260102092532-F7HL9A73.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <FloatingCloud />
        <FloatingHelpBubble />
      </body>
    </html>
  );
}
