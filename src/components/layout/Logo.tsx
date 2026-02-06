import { Link } from 'react-router-dom';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'lg';
}

/** Logo Lexora: immagine lexora-logo.png + testo LEXORA (solo testo oro, nessun box) */
export function Logo({ size = 'sm' }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const imgSize = size === 'sm' ? 'h-10 w-10' : 'h-[120px] w-[120px]';

  return (
    <Link
      to="/"
      className="flex items-center gap-4 no-underline outline-none focus:outline-none focus:ring-0 bg-transparent border-0"
      aria-label="Lexora Home"
    >
      {!imgError ? (
        <img
          src="/lexora-logo.png"
          alt=""
          className={`${imgSize} object-contain flex-shrink-0`}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-serif text-2xl font-bold text-[#d4af37] flex-shrink-0">L</span>
      )}
      <span
        className={`font-serif font-semibold text-[#d4af37] tracking-[0.2em] bg-transparent ${size === 'sm' ? 'text-2xl' : 'text-4xl'}`}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        LEXORA
      </span>
    </Link>
  );
}
