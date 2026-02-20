import fs from 'fs';
import path from 'path';
import { IconGrid } from './components/IconGrid';
import { SearchHeader } from './components/SearchHeader';

interface Icon {
  name: string;
  category: string;
  path: string;
}

async function getIconsMeta(): Promise<{ icons: Icon[]; categories: string[] }> {
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
      icons.push({
        name: file.replace('.svg', ''),
        category,
        path: `/svg/${category}/${file}`
      });
    }
  }

  return {
    icons,
    categories: Array.from(new Set(icons.map(i => i.category))).sort()
  };
}

export default async function Home() {
  const { icons, categories } = await getIconsMeta();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      <SearchHeader icons={icons} categories={categories} />
    </div>
  );
}
