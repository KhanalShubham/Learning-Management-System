import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[300px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'students',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Students Directory</h2>
              <p className="text-muted-foreground mt-1">Manage and view all students currently enrolled in Deukhuri Digital Campus.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'teachers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">Teachers Directory</h2>
              <p className="text-muted-foreground mt-1">Manage and view teacher records, profiles, and designations.</p>
            </div>
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-bold">System Settings</h2>
              <p className="text-muted-foreground mt-1">General ERP and campus configuration panel.</p>
            </div>
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
