import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Icons - Open Source Icon Library for Solana Ecosystem",
  description: "Beautiful, open-source icon library for the Solana ecosystem. 16+ icons across wallets, infrastructure, and more. Free SVG and PNG downloads.",
  openGraph: {
    title: "Solana Icons",
    description: "Open source icon library for the Solana ecosystem",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.className}>
        {children}
      </body>
    </html>
  );
}
