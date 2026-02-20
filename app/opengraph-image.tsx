import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export const alt = 'Solana Icons - Open Source Icon Library';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Solana Logo - Simplified gradient version */}
        <div
          style={{
            display: 'flex',
            width: '160px',
            height: '160px',
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
            borderRadius: '32px',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 120,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          S
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #9945FF 0%, #14F195 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '20px',
          }}
        >
          Solana Icons
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 32,
            color: '#888',
            textAlign: 'center',
          }}
        >
          Open-source icon library for the Solana ecosystem
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '40px',
            fontSize: 24,
            color: '#666',
          }}
        >
          <span>362+ icons</span>
          <span>•</span>
          <span>10 categories</span>
          <span>•</span>
          <span>Free SVG & PNG</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
