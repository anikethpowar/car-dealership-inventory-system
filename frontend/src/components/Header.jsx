import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1"
          >
            Car Dealership
          </Link>

          {isAuthenticated && (
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive('/')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/inventory"
                  className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive('/admin/inventory')
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Admin Inventory
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span>{user?.email}</span>
                {isAdmin && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Admin
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm px-3 py-1.5 rounded-md font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <nav className="flex items-center gap-2">
              <Link
                to="/login"
                className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive('/login')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded-md font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm"
              >
                Register
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

