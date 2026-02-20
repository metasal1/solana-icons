'use client';

import { useState, useEffect, useRef } from 'react';

interface Icon {
  name: string;
  category: string;
  svg: string;
  path: string;
}

function LazyIcon({ icon, onClick }: { icon: Icon; onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative group flex flex-col">
      <div 
        onClick={onClick}
        className="aspect-square bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800/50 rounded-lg transition-all duration-200 cursor-pointer relative group-hover:scale-110 group-hover:border-purple-400 dark:group-hover:border-purple-600 group-hover:shadow-lg"
      >
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {isVisible ? (
            <div 
              className="w-full h-full max-w-[32px] max-h-[32px] [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          )}
        </div>
      </div>
      
      {/* Icon name */}
      <div className="mt-1.5 px-0.5">
        <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate block">{icon.name}</span>
      </div>
    </div>
  );
}

export function IconGrid({ icons }: { icons: Icon[] }) {
  const [copied, setCopied] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);

  const copyToClipboard = async (svg: string) => {
    await navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSvg = (svg: string, name: string) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async (svg: string, name: string, size: number = 512) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${name}.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
        }
      }, 'image/png');
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {icons.map((icon) => (
          <LazyIcon 
            key={icon.path} 
            icon={icon} 
            onClick={() => setSelectedIcon(icon)} 
          />
        ))}
      </div>

      {/* Modal */}
      {selectedIcon && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIcon(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIcon(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon preview */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <div 
                  className="w-24 h-24 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                  dangerouslySetInnerHTML={{ __html: selectedIcon.svg }}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedIcon.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedIcon.category}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => copyToClipboard(selectedIcon.svg)}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? '✓ Copied!' : 'Copy SVG'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadSvg(selectedIcon.svg, selectedIcon.name)}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  SVG
                </button>
                <button
                  onClick={() => downloadPng(selectedIcon.svg, selectedIcon.name, 512)}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
