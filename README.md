# Solana Icons

Icon library for the Solana ecosystem. Like Font Awesome or Lucide, but for Solana projects.

**🌐 [View all icons](https://solana-icons.vercel.app)** | [GitHub](https://github.com/metasolbot/solana-icons)

## Features

✨ **Click any icon to:**
- 📋 Copy SVG code
- ⬇️ Download SVG file
- 🖼️ Download PNG (512px)

## Vision

A comprehensive, open-source icon set covering:
- **Wallets**: Phantom, Backpack, Solflare, etc.
- **DEXes**: Jupiter, Raydium, Orca, Meteora, etc.
- **Protocols**: Marinade, Jito, Sanctum, Kamino, etc.
- **NFT Platforms**: Magic Eden, Tensor, Metaplex, etc.
- **Infrastructure**: Helius, Triton, QuickNode, etc.
- **Payments**: Solana Pay, TipLink, Sphere, etc.
- **Gaming**: Star Atlas, Genopets, Aurory, etc.
- **Social**: Dialect, Clawbook, Only1, etc.
- **Core Concepts**: SOL token, staking, compressed NFTs, Blinks, etc.

## Status

🚧 **Early Development** - 16 icons added, more coming soon!

**Current Icons:**

**Wallets (15):**
- ✅ Phantom, Backpack, Solflare, Coinbase
- ✅ TipLink, Coin98, Trust Wallet
- ✅ Magic Eden Wallet, Jupiter Wallet
- ✅ Ledger, Wallet12, OKX Wallet
- ✅ Bitget Wallet, Trezor, WalletConnect

**Infrastructure (1):**
- ✅ Triton

## Installation

```bash
npm install solana-icons
```

## Usage

**Option 1: npm Package**

```javascript
// Import all icons
import { icons, categories } from 'solana-icons';

// Get a specific icon
const phantomIcon = icons['wallets/phantom'];
console.log(phantomIcon.svg); // SVG string

// Use in React
function MyComponent() {
  return (
    <div dangerouslySetInnerHTML={{ __html: phantomIcon.svg }} />
  );
}

// List all icons
Object.keys(icons).forEach(key => {
  console.log(key); // e.g., "wallets/phantom"
});
```

**Option 2: Direct SVG Import**

```javascript
// Import raw SVG file
import phantomSvg from 'solana-icons/svg/wallets/phantom.svg';
```

**Option 3: Web Interface**
1. Visit [solana-icons.vercel.app](https://solana-icons.vercel.app)
2. Click any icon
3. Choose: Copy SVG, Download SVG, or Download PNG

**Option 4: Direct from GitHub**
```bash
# Clone the repo
git clone https://github.com/metasal1/solana-icons.git

# SVG files are in svg/ directory
cd solana-icons/svg/wallets
```

## Categories

```
svg/
├── wallets/        (15 icons) ✅
├── infrastructure/ (1 icon) ✅
├── dexes/          (coming soon)
├── protocols/      (coming soon)
├── nft/            (coming soon)
├── payments/       (coming soon)
├── gaming/         (coming soon)
├── social/         (coming soon)
└── core/           (coming soon)
```

See each category's README for wanted icons.

## Planned Features

- ✅ SVG source files
- ✅ Organized categories
- ⬜ React components
- ⬜ Vue components
- ⬜ Web font
- ⬜ npm package
- ⬜ CDN hosting
- ⬜ Figma plugin

## Contributing

Icon requests and contributions welcome! Open an issue or submit a PR.

## License

MIT
