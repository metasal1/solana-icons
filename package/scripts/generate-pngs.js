#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const SVG_DIR = path.join(__dirname, '..', 'svg');
const PNG_DIR = path.join(__dirname, '..', 'png');

const SIZES = [24, 48, 128, 256, 512];

async function svgToPng(svgPath, pngPath, size) {
  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  
  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Convert SVG to data URL
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  
  try {
    const img = await loadImage(svgDataUrl);
    ctx.drawImage(img, 0, 0, size, size);
    
    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    console.log(`✓ Generated: ${pngPath}`);
  } catch (error) {
    console.error(`✗ Failed: ${svgPath}`, error.message);
  }
}

async function processDirectory(dir, category) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath, file);
    } else if (file.endsWith('.svg')) {
      const baseName = path.basename(file, '.svg');
      
      for (const size of SIZES) {
        const pngDir = path.join(PNG_DIR, category, `${size}px`);
        fs.mkdirSync(pngDir, { recursive: true });
        
        const pngPath = path.join(pngDir, `${baseName}.png`);
        await svgToPng(filePath, pngPath, size);
      }
    }
  }
}

async function main() {
  console.log('🎨 Generating PNGs from SVGs...\n');
  
  const categories = fs.readdirSync(SVG_DIR).filter(item => {
    const itemPath = path.join(SVG_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  for (const category of categories) {
    console.log(`\n📁 Processing category: ${category}`);
    const categoryPath = path.join(SVG_DIR, category);
    await processDirectory(categoryPath, category);
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);
