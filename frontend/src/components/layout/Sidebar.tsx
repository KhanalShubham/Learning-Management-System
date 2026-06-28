import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store';
import { NAVIGATION_CONFIG } from '@/constants/navigation';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

// Icon Resolver Helper
const SidebarIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] || Icons.HelpCircle;
  return <IconComponent className={cn('h-5 w-5 shrink-0', className)} />;
};

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, simulatedRole } = useUIStore();
  const menuItems = NAVIGATION_CONFIG[simulatedRole] || [];

  // Track which submenus are manually toggled (overriding default expansion)
  const [manuallyToggled, setManuallyToggled] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (name: string) => {
    setManuallyToggled((prev) => {
      const item = menuItems.find((m) => m.name === name);
      const isActiveByDefault = !!item?.children?.some((child) => child.path === location.pathname);
      const currentVal = prev[name] !== undefined ? prev[name] : isActiveByDefault;
      return {
        ...prev,
        [name]: !currentVal,
      };
    });
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? '260px' : '78px' }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="hidden md:flex flex-col bg-card border-r border-border h-full relative overflow-hidden select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-border/80 gap-3 shrink-0">
        <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Icons.GraduationCap className="h-5.5 w-5.5 text-primary" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col truncate"
            >
              <span className="font-extrabold text-sm tracking-tight text-foreground leading-tight">
                Deukhuri Campus
              </span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                Digital ERP
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1.5 scrollbar-thin">
        {menuItems.map((item) => {
          const hasChildren = !!item.children;
          const hasActiveChild = item.children?.some((child) => child.path === location.pathname);
          const isExpanded = manuallyToggled[item.name] !== undefined
            ? manuallyToggled[item.name]
            : !!hasActiveChild;

          if (hasChildren) {
            
            return (
              <div key={item.name} className="space-y-1">
                {/* Parent Toggler */}
                <button
                  onClick={() => {
                    if (!sidebarOpen) {
                      useUIStore.getState().setSidebarOpen(true);
                    }
                    toggleSubmenu(item.name);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all hover:bg-secondary hover:text-foreground cursor-pointer',
                    hasActiveChild ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SidebarIcon name={item.icon} className={hasActiveChild ? 'text-primary' : ''} />
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                  </div>
                  {sidebarOpen && (
                    <Icons.ChevronRight
                      className={cn(
                        'h-3.5 w-3.5 transition-transform text-muted-foreground/60 shrink-0',
                        isExpanded && 'transform rotate-90 text-foreground'
                      )}
                    />
                  )}
                </button>

                {/* Submenu Children */}
                <AnimatePresence initial={false}>
                  {sidebarOpen && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-7.5 pr-1 space-y-1"
                    >
                      {item.children?.map((child) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.name}
                            to={child.path || '/'}
                            className={cn(
                              'block py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer',
                              isChildActive
                                ? 'bg-primary/8 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                            )}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path || '/'}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/95'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <SidebarIcon name={item.icon} className={isActive ? 'text-primary-foreground' : ''} />
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3.5 border-t border-border/80 shrink-0">
        <button
          onClick={() => navigate('/login')}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/8 hover:text-destructive transition-colors cursor-pointer"
        >
          <Icons.LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
