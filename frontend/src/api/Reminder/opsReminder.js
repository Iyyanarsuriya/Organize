import axiosInstance from '../axiosInstance';

export const getReminders = (params) => axiosInstance.get('/operations-sector/reminders', { params });
export const createReminder = (data) => axiosInstance.post('/operations-sector/reminders', data);
export const updateReminder = (id, data) => axiosInstance.put(`/operations-sector/reminders/${id}`, data);
export const deleteReminder = (id, params) => axiosInstance.delete(`/operations-sector/reminders/${id}`, { params });
export const triggerMissedAlert = (payload) => axiosInstance.post('/operations-sector/reminders/send-missed-alert', payload);

export const getCategories = (params) => axiosInstance.get('/operations-sector/reminder-categories', { params });
export const createCategory = (categoryData) => axiosInstance.post('/operations-sector/reminder-categories', categoryData);
export const deleteCategory = (id, params) => axiosInstance.delete(`/operations-sector/reminder-categories/${id}`, { params });

// Notes
export const getNotes = (params = { sector: 'operations' }) => axiosInstance.get('/operations-sector/notes', { params });
export const createNote = (data) => axiosInstance.post('/operations-sector/notes', { ...data, sector: 'operations' });
export const updateNote = (id, data) => axiosInstance.put(`/operations-sector/notes/${id}`, { ...data, sector: 'operations' });
export const deleteNote = (id, params = { sector: 'operations' }) => axiosInstance.delete(`/operations-sector/notes/${id}`, { params });
