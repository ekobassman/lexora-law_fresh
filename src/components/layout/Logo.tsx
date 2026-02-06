import { Link } from 'react-router-dom';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'lg';
}

/** Logo Lexora: premium crest-style (like lexora-law-main Header) */
export function Logo({ size = 'sm' }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const imgSize = size === 'sm' ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-[120px] w-[120px]';

  return (
    <Link
      to="/"
      className="flex items-center gap-2 py-2 shrink-0 no-underline outline-none focus:outline-none focus:ring-0 bg-transparent border-0"
      aria-label="Lexora Home"
    >
      {!imgError ? (
        <img
          src="/lexora-logo-gold.png"
          alt=""
          className={`${imgSize} object-contain flex-shrink-0`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-gold/60" />
          <div className="absolute inset-1 rounded-full border border-gold/30" />
          <span className="relative font-display text-base sm:text-lg font-semibold text-gold" style={{ fontFamily: 'Georgia, serif' }}>L</span>
        </div>
      )}
      <span
        className={`font-display font-medium tracking-widest text-ivory uppercase ${size === 'sm' ? 'text-lg sm:text-xl' : 'text-4xl'}`}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        LEXORA
      </span>
    </Link>
  );
}
