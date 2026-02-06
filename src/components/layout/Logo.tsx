import { Link } from 'react-router-dom';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'lg';
}

/** Logo Lexora: immagine lexora-logo.png + testo LEXORA (senza box) */
export function Logo({ size = 'sm' }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const imgSize = size === 'sm' ? 'h-12 w-12' : 'h-[120px] w-[120px]';

  return (
    <Link
      to="/"
      className="flex items-center gap-4 no-underline outline-none focus:outline-none focus:ring-0"
      aria-label="Lexora Home"
    >
      {!imgError ? (
        <img
          src="/lexora-logo.png"
          alt="Lexora"
          className={`${imgSize} object-contain flex-shrink-0`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${imgSize} rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0 ring-2 ring-[#d4af37] ring-offset-2 ring-offset-[#0f172a]`}
        >
          <span className="font-serif text-[#0f172a] font-bold" style={{ fontSize: size === 'sm' ? '1.5rem' : '3rem' }}>
            L
          </span>
        </div>
      )}
      <span
        className={`font-serif font-semibold text-[#d4af37] tracking-[0.2em] ${
          size === 'sm' ? 'text-2xl' : 'text-4xl'
        }`}
      >
        LEXORA
      </span>
    </Link>
  );
}
