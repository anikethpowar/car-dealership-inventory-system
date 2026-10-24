import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  restockVehicle,
} from '../api/vehicles';
import { formatPrice, extractErrorMessage } from '../utils/formatters';
import VehicleForm from '../components/VehicleForm';
import RestockForm from '../components/RestockForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import MessageAlert from '../components/MessageAlert';

const DEFAULT_PAGE_SIZE = 10;

export default function AdminInventoryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals state
  const [formModal, setFormModal] = useState({
    isOpen: false,
    vehicle: null,
    isSubmitting: false,
  });

  const [restockModal, setRestockModal] = useState({
    isOpen: false,
    vehicle: null,
    isSubmitting: false,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    vehicle: null,
    isDeleting: false,
  });

  const fetchInventory = async (targetPage = page) => {
    setIsLoading(true);
    setLoadError('');

    try {
      const responseData = await listVehicles({
        page: targetPage,
        page_size: pageSize,
      });

      setVehicles(responseData.items || []);
      setTotal(responseData.total || 0);
      setPage(responseData.page || 1);
    } catch (err) {
      setLoadError(extractErrorMessage(err, 'Failed to load admin inventory.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const responseData = await listVehicles({
          page: 1,
          page_size: pageSize,
        });
        if (!ignore) {
          setVehicles(responseData.items || []);
          setTotal(responseData.total || 0);
          setPage(responseData.page || 1);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setLoadError(extractErrorMessage(err, 'Failed to load admin inventory.'));
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [pageSize]);

  const handleOpenAdd = () => {
    setActionError('');
    setSuccessMessage('');
    setFormModal({ isOpen: true, vehicle: null, isSubmitting: false });
  };

  const handleOpenEdit = (vehicle) => {
    setActionError('');
    setSuccessMessage('');
    setFormModal({ isOpen: true, vehicle, isSubmitting: false });
  };

  const handleOpenRestock = (vehicle) => {
    setActionError('');
    setSuccessMessage('');
    setRestockModal({ isOpen: true, vehicle, isSubmitting: false });
  };

  const handleOpenDelete = (vehicle) => {
    setActionError('');
    setSuccessMessage('');
    setDeleteModal({ isOpen: true, vehicle, isDeleting: false });
  };

  const handleSubmitVehicle = async (payload, isEdit, vehicleId) => {
    setFormModal((prev) => ({ ...prev, isSubmitting: true }));
    setActionError('');

    try {
      if (isEdit) {
        await updateVehicle(vehicleId, payload);
        setSuccessMessage(`Vehicle "${payload.make} ${payload.model}" updated successfully.`);
      } else {
        await createVehicle(payload);
        setSuccessMessage(`Vehicle "${payload.make} ${payload.model}" created successfully.`);
      }
      setFormModal({ isOpen: false, vehicle: null, isSubmitting: false });
      await fetchInventory(isEdit ? page : 1);
    } catch (err) {
      setFormModal((prev) => ({ ...prev, isSubmitting: false }));
      throw err;
    }
  };

  const handleRestock = async (vehicleId, quantity) => {
    setRestockModal((prev) => ({ ...prev, isSubmitting: true }));
    setActionError('');

    try {
      const updated = await restockVehicle(vehicleId, quantity);
      setSuccessMessage(
        `Added ${quantity} units to ${updated.make} ${updated.model}. New stock: ${updated.quantity}.`
      );
      setRestockModal({ isOpen: false, vehicle: null, isSubmitting: false });
      await fetchInventory(page);
    } catch (err) {
      setRestockModal((prev) => ({ ...prev, isSubmitting: false }));
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.vehicle) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    setActionError('');

    const { id, make, model } = deleteModal.vehicle;
    try {
      await deleteVehicle(id);
      setSuccessMessage(`Vehicle "${make} ${model}" deleted successfully.`);
      setDeleteModal({ isOpen: false, vehicle: null, isDeleting: false });
      // If we deleted the only item on a page > 1, go to previous page
      const newPage = vehicles.length === 1 && page > 1 ? page - 1 : page;
      await fetchInventory(newPage);
    } catch (err) {
      setActionError(extractErrorMessage(err, `Failed to delete ${make} ${model}.`));
      setDeleteModal({ isOpen: false, vehicle: null, isDeleting: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                Admin Area
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Admin Inventory Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Add new vehicles, update prices and details, adjust stock levels, or remove listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              &larr; Customer View
            </Link>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
            >
              + Add Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <MessageAlert type="success" message={successMessage} />
      <MessageAlert type="error" message={actionError} />

      {/* Main Inventory View */}
      {isLoading ? (
        <LoadingScreen message="Loading admin inventory..." />
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
            onClick={() => fetchInventory(page)}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles in inventory"
          description="Get started by adding your first vehicle to the inventory system."
          actionLabel="+ Add First Vehicle"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th scope="col" className="px-6 py-3.5">
                    Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 block">
                        {v.make} {v.model}
                      </span>
                      <span className="text-xs text-slate-400">ID: #{v.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {v.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatPrice(v.price)}
                    </td>
                    <td className="px-6 py-4">
                      {v.quantity > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {v.quantity} in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenRestock(v)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          Restock
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(v)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(v)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-slate-400">#{v.id}</span>
                    <h3 className="text-base font-bold text-slate-900">
                      {v.make} {v.model}
                    </h3>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                    {v.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-y border-slate-100">
                  <span className="text-slate-500">Price</span>
                  <span className="font-bold text-slate-900">{formatPrice(v.price)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Quantity</span>
                  {v.quantity > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {v.quantity} units
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      Out of stock
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRestock(v)}
                    className="flex-1 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-center"
                  >
                    Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(v)}
                    className="flex-1 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-center"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(v)}
                    className="flex-1 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(newPage) => fetchInventory(newPage)}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {formModal.isOpen && (
        <VehicleForm
          key={formModal.vehicle ? `edit-${formModal.vehicle.id}` : 'add'}
          isOpen={formModal.isOpen}
          vehicle={formModal.vehicle}
          onClose={() => setFormModal({ isOpen: false, vehicle: null, isSubmitting: false })}
          onSubmit={handleSubmitVehicle}
          isSubmitting={formModal.isSubmitting}
        />
      )}

      {/* Restock Vehicle Modal */}
      {restockModal.isOpen && (
        <RestockForm
          key={`restock-${restockModal.vehicle?.id}`}
          isOpen={restockModal.isOpen}
          vehicle={restockModal.vehicle}
          onClose={() => setRestockModal({ isOpen: false, vehicle: null, isSubmitting: false })}
          onRestock={handleRestock}
          isSubmitting={restockModal.isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Delete Vehicle"
        message={
          deleteModal.vehicle
            ? `Are you sure you want to permanently delete "${deleteModal.vehicle.make} ${deleteModal.vehicle.model}" from inventory? This action cannot be undone.`
            : 'Are you sure you want to delete this vehicle?'
        }
        confirmLabel="Delete Vehicle"
        cancelLabel="Cancel"
        isConfirming={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, vehicle: null, isDeleting: false })}
      />
    </div>
  );
}
