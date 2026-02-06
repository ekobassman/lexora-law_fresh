import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm text-muted-foreground">© Lexora</span>
        <div className="flex gap-6">
          <Link to="/terms" className="text-sm text-muted-foreground hover:underline">
            Terms
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
