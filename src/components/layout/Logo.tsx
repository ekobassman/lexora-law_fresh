import { Link } from 'react-router-dom';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'lg';
}

/** Logo Lexora: immagine lexora-logo.png + testo LEXORA. Fallback: cerchio dorato con L */
export function Logo({ size = 'sm' }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const imgSize = size === 'sm' ? 'h-10 w-10' : 'h-[120px] w-[120px]';

  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Lexora Home">
      {!imgError ? (
        <img
          src="/lexora-logo.png"
          alt="Lexora"
          className={imgSize}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${imgSize} rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0`}
        >
          <span className="font-serif text-[#0f172a] font-bold" style={{ fontSize: size === 'sm' ? '1.25rem' : '3rem' }}>
            L
          </span>
        </div>
      )}
      <span
        className={`font-serif tracking-wider text-[#d4af37] ${
          size === 'sm' ? 'text-2xl' : 'text-4xl'
        }`}
      >
        LEXORA
      </span>
    </Link>
  );
}
