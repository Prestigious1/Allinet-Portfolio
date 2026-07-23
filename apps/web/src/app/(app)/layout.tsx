import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Ajibade Alli Akinkunmi — ALLINET OS",
  description: "Award-winning interactive developer portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} ${firaCode.variable} font-sans bg-black text-slate-200 overflow-hidden`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
