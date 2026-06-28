import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store';
import { NAVIGATION_CONFIG } from '@/constants/navigation';
import { Drawer } from '@/components/ui/Drawer';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';

// Icon Resolver
const DrawerIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] || Icons.HelpCircle;
  return <IconComponent className={cn('h-5 w-5 shrink-0', className)} />;
};

export const MobileDrawer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileNavOpen, setMobileNavOpen, simulatedRole } = useUIStore();
  const menuItems = NAVIGATION_CONFIG[simulatedRole] || [];

  // Close drawer on path change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  const handleSignOut = () => {
    setMobileNavOpen(false);
    navigate('/login');
  };

  return (
    <Drawer
      isOpen={mobileNavOpen}
      onClose={() => setMobileNavOpen(false)}
      side="left"
      size="sm"
      title={
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icons.GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm tracking-tight text-foreground leading-tight">
              Deukhuri Campus
            </span>
            <span className="text-[9px] text-primary font-bold uppercase tracking-wider">
              Digital ERP
            </span>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full justify-between pb-6 select-none">
        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 py-2">
          {menuItems.map((item) => {
            const hasChildren = !!item.children;
            
            if (hasChildren) {
              const hasActiveChild = item.children?.some((child) => child.path === location.pathname);

              return (
                <div key={item.name} className="space-y-1">
                  <div className={cn('flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mt-4', hasActiveChild && 'text-primary/60')}>
                    {item.name}
                  </div>
                  <div className="space-y-1 pl-2">
                    {item.children?.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.name}
                          to={child.path || '/'}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                            isChildActive
                              ? 'bg-primary/8 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                          )}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path || '/'}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <DrawerIcon name={item.icon} className={isActive ? 'text-primary-foreground' : ''} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div className="pt-4 border-t border-border/60 shrink-0">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
          >
            <Icons.LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
};
