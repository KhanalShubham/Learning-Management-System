import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { ToastContainer } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Global */}
        <Header />

        {/* Primary Page Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary/15 dark:bg-background/40 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      <MobileDrawer />

      {/* Toast Notification stack */}
      <ToastContainer />
    </div>
  );
};
export default DashboardLayout;
