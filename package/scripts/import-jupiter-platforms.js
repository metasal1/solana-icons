#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WEBP_DIR = path.join(__dirname, '..', 'webp', 'platforms');
const SVG_DIR = path.join(__dirname, '..', 'svg', 'platforms');
const TMP_DIR = '/tmp/solana-icons-import';

fs.mkdirSync(WEBP_DIR, { recursive: true });
fs.mkdirSync(SVG_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

async function fetchFileList() {
  const res = await fetch('https://api.github.com/repos/jup-ag/platform-list/contents/img');
  const files = await res.json();
  return files.filter(f => f.name.endsWith('.webp'));
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

function webpToPngBase64(webpPath) {
  const pngPath = webpPath.replace('.webp', '.png');
  try {
    execSync(`/opt/homebrew/bin/dwebp "${webpPath}" -o "${pngPath}" -quiet`, { stdio: 'pipe' });
    const png = fs.readFileSync(pngPath);
    fs.unlinkSync(pngPath);
    return png.toString('base64');
  } catch {
    // fallback: embed webp directly
    return null; // signal to use webp fallback
  }
}

function createSVG(base64, mimeType = 'image/png') {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" width="100" height="100">
  <image href="data:${mimeType};base64,${base64}" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
}

async function main() {
  console.log('Fetching Jupiter platform list...');
  const files = await fetchFileList();
  console.log(`Found ${files.length} webp icons`);

  let success = 0, failed = 0;

  for (const file of files) {
    const name = file.name.replace('.webp', '');
    const webpDest = path.join(WEBP_DIR, file.name);
    const svgDest = path.join(SVG_DIR, `${name}.svg`);
    const tmpWebp = path.join(TMP_DIR, file.name);

    try {
      // Download webp
      await downloadFile(file.download_url, webpDest);
      // Also copy to tmp for conversion
      fs.copyFileSync(webpDest, tmpWebp);

      // Convert to PNG base64 for SVG wrapper
      const pngBase64 = webpToPngBase64(tmpWebp);

      let svgContent;
      if (pngBase64) {
        svgContent = createSVG(pngBase64, 'image/png');
      } else {
        // fallback: embed webp as base64
        const webpBase64 = fs.readFileSync(webpDest).toString('base64');
        svgContent = createSVG(webpBase64, 'image/webp');
      }

      fs.writeFileSync(svgDest, svgContent);
      success++;
      if (success % 50 === 0) console.log(`Progress: ${success}/${files.length}`);
    } catch (e) {
      console.error(`Failed: ${file.name} — ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
}

main().catch(console.error);
