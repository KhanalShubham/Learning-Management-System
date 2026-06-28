import { GraduationCap } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background selection:bg-primary/20">
      {/* Decorative Branding Panel (Left Column, hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
              Deukhuri Campus
            </span>
            <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
              Management Portal
            </span>
          </div>
        </div>

        {/* Hero message */}
        <div className="space-y-4 relative z-10 my-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-white/75 bg-white/10 px-3 py-1 rounded-full w-max block">
            ERP Workspace
          </span>
          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
            Streamlining campus education and administration.
          </h1>
          <p className="text-sm text-white/80 leading-relaxed max-w-sm">
            Access secure tools for student registry management, academic structures, fee invoicing, and system configs.
          </p>
        </div>

        {/* System copyright footer */}
        <div className="text-xs text-white/60 relative z-10">
          &copy; {new Date().getFullYear()} Deukhuri Digital Campus.
        </div>
      </div>

      {/* Primary Card View (Right Column) */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex items-center justify-center p-6 bg-secondary/15 dark:bg-background">
        <div className="w-full max-w-md">
          {/* Logo Header (Visible on Mobile/Tablet only) */}
          <div className="flex lg:hidden flex-col items-center text-center mb-8 gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Deukhuri Digital Campus</h2>
              <p className="text-xs text-muted-foreground mt-1">Unified Campus Enterprise Portal</p>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
