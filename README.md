# Solana Icons

Open-source icon library for the Solana ecosystem.

**Live (canonical):** https://icons.sol.new  
**Worker:** `solana-icons` · Cloudflare OpenNext  
**Repo:** https://github.com/metasal1/solana-icons

> **Deploy is Cloudflare only.** Do not create or link a Vercel project.

## Dev

```bash
npm run dev
```

## Deploy (production)

```bash
export CLOUDFLARE_API_TOKEN=$(tr -d '\n' < ~/.credentials/cloudflare-workers-token.txt)
npm run deploy   # opennextjs-cloudflare build && wrangler deploy
```

Ship flow: branch → PR → merge → `npm run deploy` from `main` tree. Never push main directly.

## Package

```bash
npm i solana-icons
npm run build:package
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run deploy` | Build + wrangler Workers deploy |
| `npm run build:cf` | OpenNext build only |
| `node package/scripts/scrape-and-categorize.js` | Jupiter platform-list + categories |
| `node scripts/generate-icons-data.js` | Static icon metadata for Workers |

## License

MIT — see `LICENSE` and `CONTRIBUTING.md`.
