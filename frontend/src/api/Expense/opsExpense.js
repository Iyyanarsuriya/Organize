import axiosInstance from '../axiosInstance';

export const getTransactions = (params) => axiosInstance.get('/operations-sector/transactions', { params });
export const createTransaction = (data) => axiosInstance.post('/operations-sector/transactions', data);
export const updateTransaction = (id, data) => axiosInstance.put(`/operations-sector/transactions/${id}`, data);
export const deleteTransaction = (id) => axiosInstance.delete(`/operations-sector/transactions/${id}`);
export const getTransactionStats = (params) => axiosInstance.get('/operations-sector/transactions/stats', { params });

export const getExpenseCategories = (params = { sector: 'operations' }) => axiosInstance.get('/operations-sector/expense-categories', { params });
export const createExpenseCategory = (categoryData) => axiosInstance.post('/operations-sector/expense-categories', { ...categoryData, sector: 'operations' });
export const deleteExpenseCategory = (id, sector = 'operations') => axiosInstance.delete(`/operations-sector/expense-categories/${id}`, { params: { sector } });

// Vehicle Logs
export const getVehicleLogs = () => axiosInstance.get('/operations-sector/vehicle-logs');
export const createVehicleLog = (data) => axiosInstance.post('/operations-sector/vehicle-logs', data);
export const updateVehicleLog = (id, data) => axiosInstance.put(`/operations-sector/vehicle-logs/${id}`, data);
export const deleteVehicleLog = (id) => axiosInstance.delete(`/operations-sector/vehicle-logs/${id}`);
