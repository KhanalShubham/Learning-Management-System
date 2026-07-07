import { Link } from 'react-router-dom';
import { TimerReset, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SessionExpired = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/15 dark:bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
        <div className="h-16 w-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto ring-8 ring-warning/5 shrink-0">
          <TimerReset className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Session Expired</h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your session has ended or was signed out from another device. Please sign in again to
            continue.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/login">
            <Button size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SessionExpired;
