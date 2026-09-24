import iconsData from "./icons-data.json";
import { SearchHeader } from "./components/SearchHeader";

interface Icon {
  name: string;
  category: string;
  path: string;
}

const siteUrl = "https://icons.sol.new";

export default function Home() {
  const icons = iconsData.icons as Icon[];
  const categories = iconsData.categories as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Solana Icons",
        description:
          "Open-source Solana icon library. Free SVG and PNG downloads for Phantom, Jupiter, BONK, pump.fun, wallets, DEXes, and ecosystem brands.",
        inLanguage: "en",
        publisher: { "@id": `${siteUrl}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#org`,
        name: "Solana Icons",
        url: siteUrl,
        logo: `${siteUrl}/images/opengraph.png`,
      },
      {
        "@type": "SoftwareApplication",
        name: "Solana Icons",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description:
          "Community open-source icon pack for Solana wallets, DEXes, platforms, and brand marks. Download as PNG or SVG.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        downloadUrl: "https://www.npmjs.com/package/solana-icons",
      },
      {
        "@type": "ItemList",
        name: "Solana icon categories",
        numberOfItems: categories.length,
        itemListElement: categories.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c,
          url: siteUrl,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">
        Solana Icons — free SVG and PNG logos for Phantom, Jupiter, BONK, pump.fun,
        Backpack, Solflare, FOMO, and 500+ Solana projects
      </h1>
      <SearchHeader icons={icons} categories={categories} />
    </div>
  );
}
