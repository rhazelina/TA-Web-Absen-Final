// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
    // Auth
    AUTH_LOGIN: 'auth/login',
    AUTH_LOGOUT: 'auth/logout',
    ME: 'me',

    // Admin
    ADMIN_SUMMARY: 'admin/summary',

    // Teacher/Guru
    MY_SCHEDULES: 'me/schedules',

    // Student
    MY_ATTENDANCE_SUMMARY: 'me/attendance/summary',

    // Homeroom Teacher
    MY_HOMEROOM: 'me/homeroom',
    MY_HOMEROOM_STUDENTS: 'me/homeroom/students',
    MY_HOMEROOM_SCHEDULES: 'me/homeroom/schedules',

    // Teachers
    TEACHERS: 'teachers',

    // Students
    STUDENTS: 'students',
};

export const TOKEN_KEY = 'auth_token';
