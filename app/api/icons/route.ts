import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const svgDir = path.join(process.cwd(), 'public', 'svg');
  const iconMeta: { name: string; category: string; path: string }[] = [];
  
  const categories = fs.readdirSync(svgDir).filter(item => {
    const itemPath = path.join(svgDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(svgDir, category);
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.svg'));
    
    for (const file of files) {
      iconMeta.push({
        name: file.replace('.svg', ''),
        category,
        path: `/svg/${category}/${file}`
      });
    }
  }

  const categoriesList = Array.from(new Set(iconMeta.map(i => i.category))).sort();

  return NextResponse.json({ 
    icons: iconMeta,
    categories: categoriesList,
    count: iconMeta.length
  });
}
