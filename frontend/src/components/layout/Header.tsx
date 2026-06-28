import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore, type UserRole } from '@/store';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/services/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Avatar } from '@/components/ui/Avatar';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Laptop,
  Search,
  Check,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const navigate = useNavigate();
  const { toggleSidebar, toggleMobileNav, simulatedRole, setSimulatedRole } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Dropdown States
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Refs for closing outside
  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Mock notifications list
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Tuition Fee received from Sita Kumari (Roll #42)', read: false, time: '10m ago' },
    { id: 2, text: 'Leave request approved for Teacher Hari Prasad', read: false, time: '2h ago' },
    { id: 3, text: 'Grade 12 terminal examinations scheduled', read: true, time: '5h ago' },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: 'Success',
      description: 'All notifications marked as read',
      variant: 'success',
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setSimulatedRole(role);
    toast({
      title: 'Role Shifted',
      description: `Dashboard layout updated for ${role.toUpperCase()} access configuration`,
      variant: 'info',
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Active simulated user labels
  const userMeta = {
    admin: { name: 'Admin User', roleName: 'Super Administrator', fallback: 'AU' },
    teacher: { name: 'Hari Prasad', roleName: 'Senior Lecturer', fallback: 'HP' },
    student: { name: 'Ram Bahadur', roleName: 'Grade 10 Student', fallback: 'RB' },
  }[simulatedRole];

  return (
    <header className="h-16 border-b border-border bg-card/75 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 select-none">
      {/* Left side: toggle and breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Toggle Drawer (Mobile) */}
        <button
          onClick={toggleMobileNav}
          className="flex md:hidden p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="h-4 w-px bg-border/80 hidden sm:block" />

        {/* Dynamic breadcrumb */}
        <Breadcrumb className="hidden sm:flex" />
      </div>

      {/* Right side: search, controls, user menu */}
      <div className="flex items-center gap-3.5">
        {/* Role Simulator Switcher (Developer utility) */}
        <div className="flex items-center gap-1.5 bg-primary/8 dark:bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5 hover:bg-primary/10 transition-all">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <select
            value={simulatedRole}
            onChange={handleRoleChange}
            className="text-[11px] font-bold text-primary bg-transparent focus:outline-none appearance-none cursor-pointer pr-1"
          >
            <option value="admin">ADMIN PROFILE</option>
            <option value="teacher">TEACHER PROFILE</option>
            <option value="student">STUDENT PROFILE</option>
          </select>
        </div>

        {/* Search Placeholder */}
        <div className="relative hidden lg:flex items-center w-48">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Search panels..."
            className="w-full text-xs bg-secondary/50 border border-border rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground relative transition-all cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-40"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-6">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-border/40 last:border-b-0 hover:bg-secondary/40 transition-colors ${
                          !n.read ? 'bg-primary/4' : ''
                        }`}
                      >
                        <p className="text-xs text-foreground/80 leading-snug">{n.text}</p>
                        <span className="text-[10px] text-muted-foreground block mt-1">{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Popover */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            {theme === 'light' && <Sun className="h-5 w-5" />}
            {theme === 'dark' && <Moon className="h-5 w-5" />}
            {theme === 'system' && <Laptop className="h-5 w-5" />}
          </button>

          <AnimatePresence>
            {themeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-40"
              >
                {(['light', 'dark', 'system'] as const).map((t) => {
                  const Icon = { light: Sun, dark: Moon, system: Laptop }[t];
                  const label = t.charAt(0).toUpperCase() + t.slice(1);
                  const isSelected = theme === t;

                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setThemeOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4.5 w-4.5" />
                        {label}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-6 w-px bg-border/80" />

        {/* User Profile Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer active:scale-95 text-left"
          >
            <Avatar size="sm" fallback={userMeta?.fallback} border />
            <div className="hidden lg:flex flex-col select-none">
              <span className="text-xs font-bold text-foreground leading-none">{userMeta?.name}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{userMeta?.roleName}</span>
            </div>
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-40"
              >
                <div className="px-4 py-2 border-b border-border/60 lg:hidden">
                  <span className="text-xs font-bold text-foreground block">{userMeta?.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{userMeta?.roleName}</span>
                </div>
                <button
                  onClick={() => {
                    setUserOpen(false);
                    toast({ title: 'Profile Link', description: 'User Profile link selected' });
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setUserOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  System Settings
                </button>
                <div className="h-px bg-border/40 my-1" />
                <button
                  onClick={async () => {
                    setUserOpen(false);
                    try {
                      await api.post('/auth/logout');
                    } catch {
                      // ignore logout endpoint failure
                    }
                    useAuthStore.getState().clearSession();
                    toast({
                      title: 'Signed Out',
                      description: 'Logged out of campus session registry successfully',
                      variant: 'info',
                    });
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
