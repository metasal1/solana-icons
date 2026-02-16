# Publishing to npm

## Prerequisites

1. npm account (create at https://www.npmjs.com/signup if needed)
2. Logged in via `npm login`

## First Time Setup

```bash
npm login
# Enter your npm username, password, and email
```

## Publishing Steps

### 1. Update Version (if needed)

```bash
# Bump patch version (0.1.0 -> 0.1.1)
npm version patch

# Bump minor version (0.1.0 -> 0.2.0)
npm version minor

# Bump major version (0.1.0 -> 1.0.0)
npm version major
```

### 2. Build the Package

```bash
npm run build
```

This generates `dist/index.js`, `dist/index.mjs`, and `dist/index.d.ts` from the SVG files.

### 3. Test Locally (Optional)

```bash
# Create a tarball
npm pack

# This creates solana-icons-0.1.0.tgz
# You can test it in another project:
cd /path/to/test-project
npm install /path/to/solana-icons/solana-icons-0.1.0.tgz
```

### 4. Publish

```bash
npm publish
```

**First publish:**
```bash
npm publish --access public
```

### 5. Verify

```bash
npm view solana-icons
```

Or check: https://www.npmjs.com/package/solana-icons

## Package Contents

The published package includes:
- `dist/` - Built JavaScript files
- `svg/` - Raw SVG files
- `README.md` - Documentation
- `LICENSE` - MIT License
- `package.json` - Package metadata

Excluded (via `.npmignore`):
- `preview/` - Website source
- `scripts/` - Build scripts
- `.git/`, `.github/`, `.vercel/`
- Development files

## Updating

When adding new icons:

1. Add SVG files to appropriate `svg/` category
2. Update version: `npm version patch`
3. Build: `npm run build`
4. Publish: `npm publish`

## Automation (Future)

Consider setting up GitHub Actions to auto-publish on release:

```yaml
# .github/workflows/publish.yml
name: Publish to npm
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
