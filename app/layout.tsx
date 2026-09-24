import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

const siteUrl = "https://icons.sol.new";
const GA_ID = "G-L014ZQRPKS";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Solana Icons — free SVG and PNG logos (Phantom, Jupiter, BONK, pump.fun)",
  description:
    "Open-source Solana icon library. 567+ free SVG and PNG downloads: Phantom, Solflare, Backpack, Jupiter, BONK, pump.fun, FOMO, Raydium, Orca, and 500 more wallets, DEXes, and ecosystem brands.",
  keywords: [
    "Solana icons",
    "Solana SVG",
    "Solana PNG",
    "Phantom icon",
    "Solflare icon",
    "Backpack wallet icon",
    "Jupiter jup.ag icon",
    "BONK logo",
    "pump.fun icon",
    "FOMO family icon",
    "Raydium icon",
    "crypto icon pack",
    "open source icons",
  ],
  authors: [{ name: "Metasal", url: "https://metasal.xyz" }],
  openGraph: {
    title: "Solana Icons — 567+ free SVG & PNG logos",
    description:
      "Phantom, Jupiter, BONK, pump.fun, Backpack, Solflare, FOMO and 500+ more. Download as image.",
    type: "website",
    url: siteUrl,
    siteName: "Solana Icons",
    locale: "en_US",
    images: [
      {
        url: "/images/opengraph.png?v=4",
        width: 1200,
        height: 630,
        alt: "Solana Icons — Phantom Jupiter BONK pump.fun Backpack Solflare FOMO",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Icons — 567+ free SVG & PNG logos",
    description:
      "Phantom, Jupiter, BONK, pump.fun, Backpack, Solflare, FOMO and 500+ more.",
    images: [
      {
        url: "/images/opengraph.png?v=4",
        width: 1200,
        height: 630,
        alt: "Solana Icons — Phantom Jupiter BONK pump.fun Backpack Solflare FOMO",
      },
    ],
  },
  alternates: {
    canonical: siteUrl,
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "llms.txt" },
        { url: "/llms-full.txt", title: "llms-full.txt" },
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
