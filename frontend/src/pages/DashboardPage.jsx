import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                {isAdmin ? 'Admin Account' : 'Customer Account'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.email}
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your dealership account and view vehicle inventory.
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin/inventory"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Admin Inventory &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Admin Notice Banner if Admin */}
      {isAdmin && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-indigo-900">Administrator Privileges</h2>
            <p className="text-sm text-indigo-700 mt-0.5">
              You have access to administrative tools including adding vehicles and managing stock levels.
            </p>
          </div>
          <Link
            to="/admin/inventory"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
          >
            Manage inventory &rarr;
          </Link>
        </div>
      )}

      {/* Inventory Placeholder Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Vehicle Inventory is Coming Next
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Browsing, searching, filtering, and vehicle purchasing features will be available in the upcoming frontend phases.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Backend API is ready and connected
          </div>
        </div>
      </div>
    </div>
  );
}

