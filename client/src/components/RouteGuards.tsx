import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

/** Full-screen spinner shown while the session is being restored. */
function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
    </div>
  );
}

/** Gate for authenticated users; redirects to /login otherwise. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Gate for ADMIN users; sends non-admins back to the dashboard. */
export function AdminRoute() {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
