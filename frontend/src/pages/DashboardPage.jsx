import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { listVehicles, searchVehicles, purchaseVehicle } from '../api/vehicles';
import { extractErrorMessage } from '../utils/formatters';
import VehicleFilters from '../components/VehicleFilters';
import VehicleList from '../components/VehicleList';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import MessageAlert from '../components/MessageAlert';

const DEFAULT_PAGE_SIZE = 9;

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [purchasingId, setPurchasingId] = useState(null);

  const fetchInventory = async (targetPage, filters) => {
    setIsLoading(true);
    setLoadError('');

    try {
      let responseData;
      if (filters.searchQuery) {
        responseData = await searchVehicles({
          q: filters.searchQuery,
          page: targetPage,
          page_size: pageSize,
        });
      } else {
        const params = {
          page: targetPage,
          page_size: pageSize,
        };
        if (filters.make) params.make = filters.make;
        if (filters.model) params.model = filters.model;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice !== '' && filters.minPrice !== undefined) {
          params.min_price = filters.minPrice;
        }
        if (filters.maxPrice !== '' && filters.maxPrice !== undefined) {
          params.max_price = filters.maxPrice;
        }
        if (filters.inStockOnly) {
          params.in_stock = true;
        }

        responseData = await listVehicles(params);
      }

      setVehicles(responseData.items || []);
      setTotal(responseData.total || 0);
      setPage(responseData.page || 1);
    } catch (err) {
      setLoadError(extractErrorMessage(err, 'Failed to load vehicle inventory.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        let responseData;
        if (appliedFilters.searchQuery) {
          responseData = await searchVehicles({
            q: appliedFilters.searchQuery,
            page: 1,
            page_size: pageSize,
          });
        } else {
          const params = {
            page: 1,
            page_size: pageSize,
          };
          if (appliedFilters.make) params.make = appliedFilters.make;
          if (appliedFilters.model) params.model = appliedFilters.model;
          if (appliedFilters.category) params.category = appliedFilters.category;
          if (appliedFilters.minPrice !== '' && appliedFilters.minPrice !== undefined) {
            params.min_price = appliedFilters.minPrice;
          }
          if (appliedFilters.maxPrice !== '' && appliedFilters.maxPrice !== undefined) {
            params.max_price = appliedFilters.maxPrice;
          }
          if (appliedFilters.inStockOnly) {
            params.in_stock = true;
          }

          responseData = await listVehicles(params);
        }

        if (!ignore) {
          setVehicles(responseData.items || []);
          setTotal(responseData.total || 0);
          setPage(responseData.page || 1);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setLoadError(extractErrorMessage(err, 'Failed to load vehicle inventory.'));
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [appliedFilters, pageSize]);

  const handleApplyFilters = (newFilters) => {
    setPurchaseError('');
    setSuccessMessage('');
    setIsLoading(true);
    setAppliedFilters(newFilters);
  };

  const handleClearFilters = () => {
    setPurchaseError('');
    setSuccessMessage('');
    setIsLoading(true);
    setAppliedFilters({
      searchQuery: '',
      make: '',
      model: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStockOnly: false,
    });
  };

  const handlePageChange = (newPage) => {
    setPurchaseError('');
    setSuccessMessage('');
    fetchInventory(newPage, appliedFilters);
  };

  const handlePurchase = async (vehicleId) => {
    setPurchasingId(vehicleId);
    setPurchaseError('');
    setSuccessMessage('');

    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    const vehicleName = targetVehicle
      ? `${targetVehicle.make} ${targetVehicle.model}`
      : 'Vehicle';

    try {
      await purchaseVehicle(vehicleId);
      setSuccessMessage(
        `Purchase successful! You have purchased ${vehicleName}. Remaining stock updated.`
      );
      // Refresh inventory from the API to keep authoritative stock
      await fetchInventory(page, appliedFilters);
    } catch (err) {
      setPurchaseError(
        extractErrorMessage(err, `Failed to purchase ${vehicleName}. Please try again.`)
      );
      // Refresh in case someone else purchased the last unit
      fetchInventory(page, appliedFilters);
    } finally {
      setPurchasingId(null);
    }
  };

  const hasActiveFilters = Boolean(
    appliedFilters.searchQuery ||
      appliedFilters.make ||
      appliedFilters.model ||
      appliedFilters.category ||
      appliedFilters.minPrice !== '' ||
      appliedFilters.maxPrice !== '' ||
      appliedFilters.inStockOnly
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                {isAdmin ? 'Admin Account' : 'Customer Account'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.email}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Browse our inventory of available vehicles and complete your purchase online.
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin/inventory"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shrink-0"
            >
              Admin Inventory Management &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      <MessageAlert type="success" message={successMessage} />
      <MessageAlert type="error" message={purchaseError} />

      {/* Search & Filter Controls */}
      <VehicleFilters
        initialFilters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingScreen message="Loading vehicles..." />
      ) : loadError ? (
        <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Inventory</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">{loadError}</p>
          <button
            type="button"
            onClick={() => fetchInventory(page, appliedFilters)}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No vehicles match your criteria' : 'No vehicles currently available'}
          description={
            hasActiveFilters
              ? 'Try widening your price range, searching for a different make or model, or clearing filters.'
              : 'Our inventory is currently empty. Please check back later.'
          }
          actionLabel={hasActiveFilters ? 'Clear all filters' : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <div className="space-y-6">
          <VehicleList
            vehicles={vehicles}
            onPurchase={handlePurchase}
            purchasingId={purchasingId}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
