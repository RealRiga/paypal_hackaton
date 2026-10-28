import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayAgent | Autonomous AI Commerce & Instant PayPal Settlement",
  description: "Next-generation Agentic Commerce platform integrating autonomous AI negotiation with live PayPal Checkout and Invoicing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}>
      <body className="min-h-full bg-[#07090E] text-[#E2E8F0] antialiased selection:bg-[#0070BA]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
