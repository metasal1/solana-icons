import fs from 'fs';
import path from 'path';
import { IconGrid } from './components/IconGrid';
import { SearchHeader } from './components/SearchHeader';

interface Icon {
  name: string;
  category: string;
  svg: string;
  path: string;
}

async function getIcons(): Promise<Icon[]> {
  const svgDir = path.join(process.cwd(), 'public', 'svg');
  const icons: Icon[] = [];
  
  const categories = fs.readdirSync(svgDir).filter(item => {
    const itemPath = path.join(svgDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(svgDir, category);
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.svg'));
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const svg = fs.readFileSync(filePath, 'utf-8');
      icons.push({
        name: file.replace('.svg', ''),
        category,
        svg,
        path: `svg/${category}/${file}`
      });
    }
  }

  return icons;
}

export default async function Home() {
  const icons = await getIcons();
  const categories = Array.from(new Set(icons.map(i => i.category))).sort();

  // Use only compact vector SVGs (non-platform) for background pattern for performance
  const compactIcons = icons.filter(i => i.category !== 'platforms');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Floating icon background pattern */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none">
        <div className="grid grid-cols-12 gap-8 p-8">
          {compactIcons.slice(0, 144).map((icon, i) => (
            <div 
              key={i} 
              className="w-8 h-8 opacity-50"
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
          ))}
        </div>
      </div>

      <SearchHeader icons={icons} categories={categories} />
    </div>
  );
}
