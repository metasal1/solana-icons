'use client';

import { useEffect, useState } from 'react';
import { IconGrid } from './components/IconGrid';
import { SearchHeader } from './components/SearchHeader';

interface Icon {
  name: string;
  category: string;
  path: string;
}

export default function Home() {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/icons')
      .then(res => res.json())
      .then(data => {
        setIcons(data.icons);
        setCategories(data.categories);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading icons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      <SearchHeader icons={icons} categories={categories} />
    </div>
  );
}
