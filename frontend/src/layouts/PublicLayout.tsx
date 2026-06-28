import { Link, Outlet } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/public" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5.5 w-5.5 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm tracking-tight text-foreground leading-tight">
                Deukhuri Campus
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Nepal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <Link to="/public" className="hover:text-foreground transition-colors">Home</Link>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button size="sm" variant="ghost">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>Portal</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Landing Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Landing Footer */}
      <footer className="border-t border-border/60 bg-secondary/30 py-8 text-xs text-muted-foreground select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Deukhuri Digital Campus</span>
          </div>
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Deukhuri Digital Campus ERP. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default PublicLayout;
