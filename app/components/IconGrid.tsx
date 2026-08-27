'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Icon {
  name: string;
  category: string;
  path: string;
}

function LazyIcon({ icon, onClick }: { icon: Icon; onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
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

  useEffect(() => {
    if (isVisible && !svgContent && icon.path) {
      fetch(icon.path)
        .then((res) => res.text())
        .then((svg) => setSvgContent(svg))
        .catch(() => setSvgContent('<svg></svg>'));
    }
  }, [isVisible, svgContent, icon.path]);

  return (
    <div ref={ref} className="relative group flex flex-col">
      <div
        onClick={onClick}
        className="aspect-square bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800/50 rounded-lg transition-all duration-200 cursor-pointer relative group-hover:scale-110 group-hover:border-purple-400 dark:group-hover:border-purple-600 group-hover:shadow-lg"
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
      </div>

      <div className="mt-1.5 px-0.5">
        <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate block">{icon.name}</span>
      </div>
    </div>
  );
}

/** Pull raw PNG/JPEG/WebP bytes out of data:image… URIs embedded in SVG wrappers */
function extractEmbeddedImageBlob(svg: string): Blob | null {
  const m = svg.match(
    /data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/i
  );
  if (!m) return null;
  const mime =
    m[1].toLowerCase() === 'jpg' || m[1].toLowerCase() === 'jpeg'
      ? 'image/jpeg'
      : m[1].toLowerCase() === 'webp'
        ? 'image/webp'
        : 'image/png';
  try {
    const bin = atob(m[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

function prepareSvgForRaster(svg: string, size: number): string {
  let out = svg.trim();
  if (!out.includes('xmlns=')) {
    out = out.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  // Prefer viewBox-based sizing; still set width/height for canvas
  if (!/viewBox=/.test(out)) {
    out = out.replace(/<svg\b/, `<svg viewBox="0 0 ${size} ${size}"`);
  }
  out = out
    .replace(/\swidth="[^"]*"/g, '')
    .replace(/\sheight="[^"]*"/g, '')
    .replace(/<svg\b/, `<svg width="${size}" height="${size}"`);
  return out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

async function blobToPngBlob(
  source: Blob,
  size: number,
  background: 'transparent' | 'white' | 'dark'
): Promise<Blob | null> {
  const url = URL.createObjectURL(source);
  try {
    const img = await loadImage(url);
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

    // contain fit centered
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;
    ctx.drawImage(img, x, y, w, h);

    return await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function svgToPngBlob(
  svg: string,
  size: number,
  background: 'transparent' | 'white' | 'dark'
): Promise<Blob | null> {
  // Fast path: embedded raster inside wrapper SVG
  const embedded = extractEmbeddedImageBlob(svg);
  if (embedded) {
    const png = await blobToPngBlob(embedded, size, background);
    if (png) return png;
  }

  const prepared = prepareSvgForRaster(svg, size);
  const svgBlob = new Blob([prepared], { type: 'image/svg+xml;charset=utf-8' });
  return blobToPngBlob(svgBlob, size, background);
}

/** Save as a real image file (image/png), not a generic document */
async function downloadAsImage(blob: Blob, filename: string) {
  // Normalize to PNG File so OS/share sheets treat it as an image
  let imageBlob = blob;
  if (blob.type !== 'image/png') {
    // re-encode non-png to png via canvas when possible
    const url = URL.createObjectURL(blob);
    try {
      const img = await loadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 512;
      canvas.height = img.naturalHeight || 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const png = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );
        if (png) imageBlob = png;
      }
    } catch {
      /* keep original */
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const safeName = filename.endsWith('.png') ? filename : `${filename}.png`;
  const file = new File([imageBlob], safeName, {
    type: 'image/png',
    lastModified: Date.now(),
  });

  // Mobile / modern: share sheet shows image preview
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: safeName,
      });
      return;
    } catch (e) {
      // user cancel or share fail → fall through to anchor download
      if ((e as Error)?.name === 'AbortError') return;
    }
  }

  const objectUrl = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = safeName;
  a.type = 'image/png';
  a.rel = 'noopener';
  // helps some WebViews treat target as image
  a.setAttribute('download', safeName);
  document.body.appendChild(a);
  a.click();
  a.remove();
  // revoke after the browser has started the download
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
}

function downloadSvgCode(svg: string, name: string) {
  // Still available as secondary — XML source, not the primary image path
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function IconGrid({ icons }: { icons: Icon[] }) {
  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSvg, setSelectedSvg] = useState<string>('');
  const [pngSize, setPngSize] = useState<128 | 256 | 512>(512);
  const [pngBg, setPngBg] = useState<'transparent' | 'white' | 'dark'>('transparent');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const selectedIcon = selectedIndex !== null ? icons[selectedIndex] : null;

  const openModal = useCallback(
    async (icon: Icon) => {
      const idx = icons.findIndex((i) => i.path === icon.path);
      setSelectedIndex(idx >= 0 ? idx : 0);
      setSelectedSvg('');
      setDownloadError(null);
      if (icon.path) {
        try {
          const svg = await fetch(icon.path).then((res) => res.text());
          setSelectedSvg(svg);
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
      setDownloadError(null);
      const icon = icons[idx];
      if (icon?.path) {
        try {
          const svg = await fetch(icon.path).then((res) => res.text());
          setSelectedSvg(svg);
        } catch {
          setSelectedSvg('');
        }
      }
    },
    [icons]
  );

  const goPrev = useCallback(() => {
    if (selectedIndex === null || icons.length === 0) return;
    const next = (selectedIndex - 1 + icons.length) % icons.length;
    void loadAtIndex(next);
  }, [selectedIndex, icons.length, loadAtIndex]);

  const goNext = useCallback(() => {
    if (selectedIndex === null || icons.length === 0) return;
    const next = (selectedIndex + 1) % icons.length;
    void loadAtIndex(next);
  }, [selectedIndex, icons.length, loadAtIndex]);

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
    setSelectedSvg('');
    setCopied(false);
    setDownloadError(null);
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

  const downloadImage = async (svg: string, name: string) => {
    if (!svg) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await svgToPngBlob(svg, pngSize, pngBg);
      if (!blob) {
        setDownloadError('Could not render image — try another size or Copy SVG');
        return;
      }
      const suffix = pngBg === 'transparent' ? '' : `-${pngBg}`;
      await downloadAsImage(blob, `${name}-${pngSize}${suffix}.png`);
    } catch {
      setDownloadError('Download failed');
    } finally {
      setDownloading(false);
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
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
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 tabular-nums">
                {positionLabel} · ← →
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Primary: download as image (PNG) */}
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-2">
                <p className="text-xs font-medium text-purple-300 uppercase tracking-wide">
                  Download as image
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {([128, 256, 512] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPngSize(s)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        pngSize === s
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => downloadImage(selectedSvg, selectedIcon.name)}
                  disabled={!selectedSvg || downloading}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {downloading ? 'Preparing image…' : `Download image (${pngSize}px PNG)`}
                </button>
                {downloadError && (
                  <p className="text-xs text-red-400 text-center">{downloadError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedSvg)}
                  disabled={!selectedSvg}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {copied ? '✓ Copied' : 'Copy SVG'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadSvgCode(selectedSvg, selectedIcon.name)}
                  disabled={!selectedSvg}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  SVG code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
