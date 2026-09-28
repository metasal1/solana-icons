'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Icon {
  name: string;
  category: string;
  path: string;
}

function extractEmbeddedImageBlob(svg: string): Blob | null {
  const m = svg.match(/data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=\s]+)/i);
  if (!m) return null;
  const mime = m[1].toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${m[1].toLowerCase()}`;
  const b64 = m[2].replace(/\s/g, '');
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime === 'image/webp' ? 'image/png' : mime });
  } catch {
    return null;
  }
}

function prepareSvgForRaster(svg: string, size: number): string {
  let out = svg.trim();
  if (!out.includes('xmlns=')) {
    out = out.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (/\swidth=/.test(out) || /\sheight=/.test(out)) {
    out = out.replace(/\swidth="[^"]*"/, ` width="${size}"`).replace(/\sheight="[^"]*"/, ` height="${size}"`);
    if (!/\swidth=/.test(out)) out = out.replace(/<svg\b/, `<svg width="${size}"`);
    if (!/\sheight=/.test(out)) out = out.replace(/<svg\b/, `<svg height="${size}"`);
  } else {
    out = out.replace(/<svg\b/, `<svg width="${size}" height="${size}"`);
  }
  return out;
}

async function svgToPngBlob(
  svg: string,
  size: number,
  background: 'transparent' | 'white' | 'dark' = 'transparent'
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  if (background === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
  } else if (background === 'dark') {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);
  }

  const embedded = extractEmbeddedImageBlob(svg);
  const srcBlob =
    embedded ||
    new Blob([prepareSvgForRaster(svg, size)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(srcBlob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/png');
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function downloadAsImage(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type || 'image/png' });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  try {
    if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: filename });
      return;
    }
  } catch {
    /* fall through */
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.type = file.type;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function downloadSvgFile(svg: string, name: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  void downloadAsImage(blob, `${name}.svg`);
}

async function fetchSvg(path: string): Promise<string> {
  const res = await fetch(path);
  return res.text();
}

function LazyIcon({ icon, onClick }: { icon: Icon; onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [busy, setBusy] = useState<'svg' | 'png' | null>(null);
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !svgContent && icon.path) {
      fetchSvg(icon.path)
        .then(setSvgContent)
        .catch(() => setSvgContent('<svg></svg>'));
    }
  }, [isVisible, svgContent, icon.path]);

  const onSvg = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgContent) return;
    setBusy('svg');
    try {
      downloadSvgFile(svgContent, icon.name);
    } finally {
      setBusy(null);
    }
  };

  const onPng = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgContent) return;
    setBusy('png');
    try {
      const blob = await svgToPngBlob(svgContent, 256, 'transparent');
      if (blob) await downloadAsImage(blob, `${icon.name}-256.png`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} className="relative group flex flex-col">
      <div
        onClick={onClick}
        className="aspect-square bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800/50 rounded-lg transition-all duration-200 cursor-pointer relative group-hover:scale-105 group-hover:border-purple-400 dark:group-hover:border-purple-600 group-hover:shadow-lg"
      >
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {svgContent ? (
            <div
              className="w-full h-full max-w-[32px] max-h-[32px] [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onSvg}
            disabled={!svgContent || busy !== null}
            className="flex-1 text-[9px] font-bold tracking-wide py-0.5 rounded bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-500"
          >
            {busy === 'svg' ? '…' : 'SVG'}
          </button>
          <button
            type="button"
            onClick={onPng}
            disabled={!svgContent || busy !== null}
            className="flex-1 text-[9px] font-bold tracking-wide py-0.5 rounded bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-500"
          >
            {busy === 'png' ? '…' : 'PNG'}
          </button>
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate block">{icon.name}</span>
      </div>
    </div>
  );
}

export function IconGrid({ icons }: { icons: Icon[] }) {
  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSvg, setSelectedSvg] = useState<string>('');
  const [pngSize, setPngSize] = useState<128 | 256 | 512>(512);
  const [pngBg, setPngBg] = useState<'transparent' | 'white' | 'dark'>('transparent');
  const [downloading, setDownloading] = useState<'svg' | 'png' | null>(null);

  const selectedIcon = selectedIndex !== null ? icons[selectedIndex] : null;

  const openModal = useCallback(
    async (icon: Icon) => {
      const idx = icons.findIndex((i) => i.path === icon.path);
      setSelectedIndex(idx >= 0 ? idx : 0);
      setSelectedSvg('');
      if (icon.path) {
        try {
          setSelectedSvg(await fetchSvg(icon.path));
        } catch {
          setSelectedSvg('');
        }
      }
    },
    [icons]
  );

  const loadAtIndex = useCallback(
    async (idx: number) => {
      if (idx < 0 || idx >= icons.length) return;
      setSelectedIndex(idx);
      setSelectedSvg('');
      setCopied(false);
      const icon = icons[idx];
      if (icon?.path) {
        try {
          setSelectedSvg(await fetchSvg(icon.path));
        } catch {
          setSelectedSvg('');
        }
      }
    },
    [icons]
  );

  const goPrev = useCallback(() => {
    if (selectedIndex === null || icons.length === 0) return;
    void loadAtIndex((selectedIndex - 1 + icons.length) % icons.length);
  }, [selectedIndex, icons.length, loadAtIndex]);

  const goNext = useCallback(() => {
    if (selectedIndex === null || icons.length === 0) return;
    void loadAtIndex((selectedIndex + 1) % icons.length);
  }, [selectedIndex, icons.length, loadAtIndex]);

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
    setSelectedSvg('');
    setCopied(false);
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex, closeModal, goPrev, goNext]);

  const copyToClipboard = async (svg: string) => {
    await navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onDownloadSvg = () => {
    if (!selectedSvg || !selectedIcon) return;
    setDownloading('svg');
    try {
      downloadSvgFile(selectedSvg, selectedIcon.name);
    } finally {
      setDownloading(null);
    }
  };

  const onDownloadPng = async () => {
    if (!selectedSvg || !selectedIcon) return;
    setDownloading('png');
    try {
      const blob = await svgToPngBlob(selectedSvg, pngSize, pngBg);
      if (blob) {
        const suffix = pngBg === 'transparent' ? '' : `-${pngBg}`;
        await downloadAsImage(blob, `${selectedIcon.name}-${pngSize}${suffix}.png`);
      }
    } finally {
      setDownloading(null);
    }
  };

  const positionLabel = useMemo(() => {
    if (selectedIndex === null) return '';
    return `${selectedIndex + 1} / ${icons.length}`;
  }, [selectedIndex, icons.length]);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {icons.map((icon) => (
          <LazyIcon key={icon.path} icon={icon} onClick={() => openModal(icon)} />
        ))}
      </div>

      {selectedIcon && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            type="button"
            aria-label="Previous icon"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-purple-600 hover:text-white hover:border-purple-500 transition text-gray-700 dark:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next icon"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-purple-600 hover:text-white hover:border-purple-500 transition text-gray-700 dark:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                {selectedSvg ? (
                  <div
                    className="w-24 h-24 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    dangerouslySetInnerHTML={{ __html: selectedSvg }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedIcon.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedIcon.category}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 tabular-nums">{positionLabel} · ← →</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={onDownloadSvg}
                disabled={!selectedSvg || downloading !== null}
                className="px-4 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              >
                SVG
              </button>
              <button
                type="button"
                onClick={onDownloadPng}
                disabled={!selectedSvg || downloading !== null}
                className="px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              >
                {downloading === 'png' ? '…' : 'PNG'}
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2 mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">PNG options</p>
              <div className="flex flex-wrap gap-1.5">
                {([128, 256, 512] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPngSize(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      pngSize === s
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['transparent', 'Clear'],
                    ['white', 'White'],
                    ['dark', 'Dark'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPngBg(value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      pngBg === value
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(selectedSvg)}
              disabled={!selectedSvg}
              className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {copied ? 'Copied SVG' : 'Copy SVG'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
