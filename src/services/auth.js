import apiClient from './api';
import { API_ENDPOINTS, TOKEN_KEY } from '../utils/constants';

export const authService = {
    /**
   * Login user and store token
   */
    async login(login, password = '') {
        const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, {
            login,
            password: password || '', // Send empty string if no password (for NISN login)
        });

        const { token, user } = response.data;

        // Store token
        localStorage.setItem(TOKEN_KEY, token);

        return { token, user };
    },

    /**
     * Logout user and clear token
     */
    async logout() {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local data
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('userRole');
            localStorage.removeItem('userIdentifier');
        }
    },

    /**
     * Get current user data
     */
    async getMe() {
        const response = await apiClient.get(API_ENDPOINTS.ME);
        return response.data;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem(TOKEN_KEY);
    },
};
