#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SVG_DIR = path.join(__dirname, '..', 'svg');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Clean and create dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Collect all icons
const icons = {};
const categories = fs.readdirSync(SVG_DIR).filter(item => {
  const itemPath = path.join(SVG_DIR, item);
  return fs.statSync(itemPath).isDirectory();
});

for (const category of categories) {
  const categoryPath = path.join(SVG_DIR, category);
  const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.svg'));
  
  for (const file of files) {
    const filePath = path.join(categoryPath, file);
    const svgContent = fs.readFileSync(filePath, 'utf-8');
    const iconName = file.replace('.svg', '');
    const key = `${category}/${iconName}`;
    
    icons[key] = {
      name: iconName,
      category,
      svg: svgContent
    };
  }
}

// Generate CommonJS index
const cjsExports = Object.entries(icons).map(([key, icon]) => {
  const varName = key.replace(/[^a-zA-Z0-9]/g, '_');
  return `exports.${varName} = ${JSON.stringify(icon)};`;
}).join('\n');

const cjsIndex = `// Generated file - do not edit
${cjsExports}

exports.icons = ${JSON.stringify(icons, null, 2)};
exports.categories = ${JSON.stringify(categories)};
`;

fs.writeFileSync(path.join(DIST_DIR, 'index.js'), cjsIndex);

// Generate ES Module index
const esmExports = Object.entries(icons).map(([key, icon]) => {
  const varName = key.replace(/[^a-zA-Z0-9]/g, '_');
  return `export const ${varName} = ${JSON.stringify(icon)};`;
}).join('\n');

const esmIndex = `// Generated file - do not edit
${esmExports}

export const icons = ${JSON.stringify(icons, null, 2)};
export const categories = ${JSON.stringify(categories)};
`;

fs.writeFileSync(path.join(DIST_DIR, 'index.mjs'), esmIndex);

// Generate TypeScript definitions
const tsInterface = `// Generated file - do not edit
export interface Icon {
  name: string;
  category: string;
  svg: string;
}

export type IconKey = ${Object.keys(icons).map(k => `'${k}'`).join(' | ')};

${Object.entries(icons).map(([key]) => {
  const varName = key.replace(/[^a-zA-Z0-9]/g, '_');
  return `export declare const ${varName}: Icon;`;
}).join('\n')}

export declare const icons: Record<IconKey, Icon>;
export declare const categories: string[];
`;

fs.writeFileSync(path.join(DIST_DIR, 'index.d.ts'), tsInterface);

console.log(`✅ Built ${Object.keys(icons).length} icons across ${categories.length} categories`);
console.log(`📦 Output: dist/index.js, dist/index.mjs, dist/index.d.ts`);
