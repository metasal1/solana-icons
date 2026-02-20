import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
