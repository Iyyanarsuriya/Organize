import axiosInstance from '../axiosInstance';

export const getMfgPayroll = (params) => {
    return axiosInstance.get('/operations-sector/payroll', { params });
};

export const generateMfgPayroll = (data) => {
    return axiosInstance.post('/operations-sector/payroll/generate', data);
};

export const approveMfgPayroll = (id) => {
    return axiosInstance.post(`/operations-sector/payroll/${id}/approve`);
};

export const deleteMfgPayroll = (id) => {
    return axiosInstance.delete(`/operations-sector/payroll/${id}`);
};

export const revertMfgPayroll = (id) => {
    return axiosInstance.post(`/operations-sector/payroll/${id}/revert`);
};
