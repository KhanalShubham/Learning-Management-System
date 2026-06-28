import { useUIStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Sparkles, Calendar } from 'lucide-react';

export const WelcomeCard = () => {
  const simulatedRole = useUIStore((state) => state.simulatedRole);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const greeting = getGreeting();

  const meta = {
    admin: {
      name: 'Admin User',
      focus: 'System health is optimal. You have 2 pending leave applications and 1 audit review log today.',
    },
    teacher: {
      name: 'Hari Prasad',
      focus: 'Your class attendance lists are compiled. Grade 10 English lectures start at 10:30 AM.',
    },
    student: {
      name: 'Ram Bahadur',
      focus: 'Your terminal report cards are published. Check out the Exams panel to view marks.',
    },
  }[simulatedRole];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden flex flex-col justify-between md:flex-row md:items-center gap-6 animate-in fade-in duration-500">
      {/* Background patterns */}
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          Campus ERP Workspace
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {meta?.name}
        </h2>
        <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
          {meta?.focus}
        </p>
      </div>

      <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3 relative z-10 shrink-0 self-start md:self-auto text-xs font-semibold text-foreground/80">
        <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
        {currentDate}
      </div>
    </Card>
  );
};
export default WelcomeCard;
