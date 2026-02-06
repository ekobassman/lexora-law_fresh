import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      className="border-t py-8 mt-auto"
      style={{ borderColor: 'rgba(212,175,55,0.2)', backgroundColor: '#0f172a' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm text-slate-400">© Lexora</span>
        <div className="flex gap-6">
          <Link to="/terms" className="text-sm text-slate-400 hover:text-[#d4af37] transition">
            Terms
          </Link>
          <Link to="/privacy" className="text-sm text-slate-400 hover:text-[#d4af37] transition">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
