import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function getAuthToken() {
  return localStorage.getItem('token');
}

function getHeaders() {
  return {
    Authorization: `Bearer ${getAuthToken()}`,
  };
}

// Clients API
export const clientsAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/api/clients`, { headers: getHeaders() });
    return response.data;
  },
  create: async (client) => {
    const response = await axios.post(`${API_URL}/api/clients`, client, { headers: getHeaders() });
    return response.data;
  },
  update: async (id, client) => {
    const response = await axios.put(`${API_URL}/api/clients/${id}`, client, { headers: getHeaders() });
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/api/clients/${id}`, { headers: getHeaders() });
    return response.data;
  },
};

// Invoices API
export const invoicesAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/api/invoices`, { headers: getHeaders() });
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/api/invoices/${id}`, { headers: getHeaders() });
    return response.data;
  },
  create: async (invoice) => {
    const response = await axios.post(`${API_URL}/api/invoices`, invoice, { headers: getHeaders() });
    return response.data;
  },
  update: async (id, invoice) => {
    const response = await axios.put(`${API_URL}/api/invoices/${id}`, invoice, { headers: getHeaders() });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await axios.patch(`${API_URL}/api/invoices/${id}/status`, { status }, { headers: getHeaders() });
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/api/invoices/${id}`, { headers: getHeaders() });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await axios.get(`${API_URL}/api/dashboard/stats`, { headers: getHeaders() });
    return response.data;
  },
};
