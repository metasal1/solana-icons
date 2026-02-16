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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const copyToClipboard = async (svg: string, name: string) => {
    await navigator.clipboard.writeText(svg);
    setCopied(name);
    setActiveMenu(null);
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
    setActiveMenu(null);
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
    setActiveMenu(null);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {icons.map((icon) => (
        <div
          key={icon.path}
          className="group relative bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-6 transition-all duration-200 hover:scale-105 border border-gray-700/50 hover:border-purple-500/50"
          onClick={(e) => {
            if (activeMenu === icon.name) {
              setActiveMenu(null);
            } else {
              setActiveMenu(icon.name);
            }
          }}
        >
          <div 
            className="w-12 h-12 mx-auto mb-3 pointer-events-none"
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
          <p className="text-xs text-gray-300 group-hover:text-white transition truncate pointer-events-none">
            {icon.name}
          </p>
          
          {copied === icon.name && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-600/90 rounded-lg pointer-events-none z-20">
              <span className="text-white text-sm font-medium">✓ Copied!</span>
            </div>
          )}
          
          {activeMenu === icon.name && (
            <div 
              className="absolute inset-0 bg-gray-900/95 rounded-lg p-2 flex flex-col gap-1 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => copyToClipboard(icon.svg, icon.name)}
                className="w-full px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy SVG
              </button>
              <button
                onClick={() => downloadSvg(icon.svg, icon.name)}
                className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                SVG
              </button>
              <button
                onClick={() => downloadPng(icon.svg, icon.name, 512)}
                className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PNG (512px)
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
