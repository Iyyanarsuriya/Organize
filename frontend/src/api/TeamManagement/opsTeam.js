import axiosInstance from '../axiosInstance';

export const getMembers = (params) => axiosInstance.get('/operations-sector/members', { params });
export const getActiveMembers = (params) => axiosInstance.get('/operations-sector/members/active', { params });
export const createMember = (data) => axiosInstance.post('/operations-sector/members', data);
export const updateMember = (id, data) => axiosInstance.put(`/operations-sector/members/${id}`, data);
export const deleteMember = (id) => axiosInstance.delete(`/operations-sector/members/${id}`);
export const getGuests = (params) => axiosInstance.get('/operations-sector/members/guests/all', { params });

export const getMemberRoles = (params) => axiosInstance.get('/operations-sector/member-roles', { params });
export const createMemberRole = (data) => axiosInstance.post('/operations-sector/member-roles', data);
export const deleteMemberRole = (id) => axiosInstance.delete(`/operations-sector/member-roles/${id}`);
