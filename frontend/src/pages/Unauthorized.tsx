import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/15 dark:bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto ring-8 ring-destructive/5 shrink-0">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Access Denied</h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            You do not possess the security clearance permissions required to view this ERP section module.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Unauthorized;
