import apiClient from './client';

export const listVehicles = async (params = {}) => {
  const response = await apiClient.get('/api/vehicles', { params });
  return response.data;
};

export const searchVehicles = async (params = {}) => {
  const response = await apiClient.get('/api/vehicles/search', { params });
  return response.data;
};

export const getVehicle = async (vehicleId) => {
  const response = await apiClient.get(`/api/vehicles/${vehicleId}`);
  return response.data;
};

export const createVehicle = async (payload) => {
  const response = await apiClient.post('/api/vehicles', payload);
  return response.data;
};

export const updateVehicle = async (vehicleId, payload) => {
  const response = await apiClient.put(`/api/vehicles/${vehicleId}`, payload);
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await apiClient.delete(`/api/vehicles/${vehicleId}`);
  return response.data;
};

export const purchaseVehicle = async (vehicleId) => {
  const response = await apiClient.post(`/api/vehicles/${vehicleId}/purchase`);
  return response.data;
};

export const restockVehicle = async (vehicleId, quantity) => {
  const response = await apiClient.post(`/api/vehicles/${vehicleId}/restock`, {
    quantity: Number(quantity),
  });
  return response.data;
};

