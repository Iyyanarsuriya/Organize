import axiosInstance from '../axiosInstance';

// Attendance
export const getAttendances = (params) => axiosInstance.get('/operations-sector/attendance', { params });
export const createAttendance = (data) => axiosInstance.post('/operations-sector/attendance', data);
export const quickMarkAttendance = (data) => axiosInstance.post('/operations-sector/attendance/quick', data);
export const bulkMarkAttendance = (data) => axiosInstance.post('/operations-sector/attendance/bulk', data);
export const getHolidays = (params) => axiosInstance.get('/operations-sector/attendance/holidays', { params });
export const createHoliday = (data) => axiosInstance.post('/operations-sector/attendance/holidays', data);
export const deleteHoliday = (id) => axiosInstance.delete(`/operations-sector/attendance/holidays/${id}`);
export const getShifts = (params) => axiosInstance.get('/operations-sector/attendance/shifts', { params });
export const createShift = (data) => axiosInstance.post('/operations-sector/attendance/shifts', data);
export const deleteShift = (id) => axiosInstance.delete(`/operations-sector/attendance/shifts/${id}`);
export const updateAttendance = (id, data) => axiosInstance.put(`/operations-sector/attendance/${id}`, data);
export const deleteAttendance = (id) => axiosInstance.delete(`/operations-sector/attendance/${id}`);
export const getAttendanceStats = (params) => axiosInstance.get('/operations-sector/attendance/stats', { params });
export const getMemberSummary = (params) => axiosInstance.get('/operations-sector/attendance/summary', { params });

// Projects
export const getProjects = (params) => axiosInstance.get('/operations-sector/projects', { params });
export const createProject = (data) => axiosInstance.post('/operations-sector/projects', data);
export const deleteProject = (id) => axiosInstance.delete(`/operations-sector/projects/${id}`);

// Work Logs
export const createWorkLog = (data) => axiosInstance.post('/operations-sector/work-logs', data);
export const getWorkLogs = (params) => axiosInstance.get('/operations-sector/work-logs', { params });
export const getMonthlyTotal = (params) => axiosInstance.get('/operations-sector/work-logs/monthly-total', { params });
export const updateWorkLog = (id, data) => axiosInstance.put(`/operations-sector/work-logs/${id}`, data);
export const deleteWorkLog = (id) => axiosInstance.delete(`/operations-sector/work-logs/${id}`);

// Work Types
export const getWorkTypes = (params) => axiosInstance.get('/operations-sector/work-types', { params });
export const createWorkType = (data) => axiosInstance.post('/operations-sector/work-types', data);
export const deleteWorkType = (id) => axiosInstance.delete(`/operations-sector/work-types/${id}`);
