'use client';

import { useState } from 'react';

interface Icon {
  name: string;
  category: string;
  svg: string;
  path: string;
}

export function IconGrid({ icons }: { icons: Icon[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const copyToClipboard = async (svg: string, name: string) => {
    await navigator.clipboard.writeText(svg);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
      {icons.map((icon) => {
        // Brand icons get wider aspect ratio (horizontal logos)
        const isBrand = icon.category === 'brand';
        const aspectClass = isBrand ? 'aspect-[3/1]' : 'aspect-square';
        
        return (
        <div
          key={icon.path}
          className={`relative group ${aspectClass}`}
          onMouseEnter={() => setHoveredIcon(icon.name)}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <div className="absolute inset-0 bg-gray-900/30 hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700 rounded-lg transition-all duration-200 cursor-pointer">
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div 
                className={`${isBrand ? 'w-full h-6' : 'w-8 h-8'} transition-transform group-hover:scale-110`}
                dangerouslySetInnerHTML={{ __html: icon.svg }}
              />
            </div>

            {/* Icon name tooltip */}
            {hoveredIcon === icon.name && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-30 pointer-events-none shadow-xl border border-gray-700">
                {icon.name}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
              </div>
            )}

            {/* Action buttons (show on hover) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 rounded-lg">
              <div className="flex flex-col gap-1 w-full px-2">
                <button
                  onClick={() => copyToClipboard(icon.svg, icon.name)}
                  className="w-full px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] transition flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => downloadSvg(icon.svg, icon.name)}
                  className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] transition flex items-center justify-center gap-1"
                >
                  SVG
                </button>
                <button
                  onClick={() => downloadPng(icon.svg, icon.name, 512)}
                  className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] transition flex items-center justify-center gap-1"
                >
                  PNG
                </button>
              </div>
            </div>

            {/* Copied notification */}
            {copied === icon.name && (
              <div className="absolute inset-0 flex items-center justify-center bg-purple-600/90 rounded-lg z-20 pointer-events-none">
                <span className="text-white text-xs font-medium">✓ Copied!</span>
              </div>
            )}
          </div>
        </div>
      )})}
    </div>
  );
}
