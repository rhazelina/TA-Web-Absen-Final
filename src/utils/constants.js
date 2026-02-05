// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

export const API_ENDPOINTS = {
    // Auth
    AUTH_LOGIN: '/api/auth/login',
    AUTH_LOGOUT: '/api/auth/logout',
    ME: '/api/me',

    // Admin
    ADMIN_SUMMARY: '/api/admin/summary',

    // Teacher/Guru
    MY_SCHEDULES: '/api/me/schedules',

    // Student
    MY_ATTENDANCE_SUMMARY: '/api/me/attendance/summary',

    // Homeroom Teacher
    MY_HOMEROOM: '/api/me/homeroom',
    MY_HOMEROOM_STUDENTS: '/api/me/homeroom/students',
    MY_HOMEROOM_SCHEDULES: '/api/me/homeroom/schedules',
};

export const TOKEN_KEY = 'auth_token';
