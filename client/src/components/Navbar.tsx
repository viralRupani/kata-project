import { useAuth } from '../context/AuthContext.js';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚗</span>
          <span className="text-lg font-bold text-slate-900">AutoHub</span>
          {isAdmin && (
            <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
              Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-500 sm:inline">{user?.name}</span>
          <button
            onClick={() => void logout()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
