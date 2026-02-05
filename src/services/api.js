import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - add token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('userRole');
            localStorage.removeItem('userIdentifier');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// QR Code API Functions
export const generateQRCode = async (scheduleId, duration = 30) => {
    const response = await apiClient.post('/qrcodes/generate', {
        schedule_id: scheduleId,
        duration: duration
    });
    return response.data;
};

export const scanQRCode = async (token) => {
    const response = await apiClient.post('/attendance/scan', {
        qr_token: token
    });
    return response.data;
};

export const getActiveQRCodes = async () => {
    const response = await apiClient.get('/qrcodes/active');
    return response.data;
};

export default apiClient;

