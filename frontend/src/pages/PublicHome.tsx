import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, Cpu, Layout, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PublicHome = () => {
  const highlights = [
    {
      title: 'Dynamic Design System',
      desc: 'Sleek dark and light modes, fluid transitions, and rich HSL color palettes tailored for Deukhuri.',
      icon: Layout,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Role-Based Dashboards',
      desc: 'Custom framework delivering tailored workspaces for Super Administrators, Teachers, and Students.',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Enterprise ERP Modules',
      desc: 'Ready-to-integrate templates for Admissions, Grading Ledgers, Attendance Registers, and CMS.',
      icon: Cpu,
      color: 'text-violet-500 bg-violet-500/10',
    },
    {
      title: 'State of the Art Shell',
      desc: 'Collapsible accordion menus, global search inputs, responsive mobile drawers, and toast alerts.',
      icon: Compass,
      color: 'text-amber-500 bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-20 pb-20 select-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_left] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider animate-bounce">
            <GraduationCap className="h-4 w-4" />
            Empowering Campus Excellence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            The Modern Education Operating System for <span className="text-primary bg-clip-text">Deukhuri Campus</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Deukhuri Digital Campus ERP brings administration, teaching staff, and students together in one seamless, high-performance ecosystem.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/login">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Go to Portal
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Why Deukhuri ERP?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Engineered to remove administrative friction and elevate student learning benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-card border border-border/80 rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className={`p-3 rounded-xl w-max mb-5 ${item.color} group-hover:scale-105 transition-transform`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-foreground leading-snug">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default PublicHome;
