import apiClient from './api';

// Attendance API Functions
export const getMyAttendance = async (params = {}) => {
    const response = await apiClient.get('attendance/me', { params });
    return response.data;
};

export const getMyAttendanceSummary = async (params = {}) => {
    const response = await apiClient.get('attendance/me/summary', { params });
    return response.data;
};

export const getTeachingAttendance = async (params = {}) => {
    const response = await apiClient.get('attendance/me/teaching', { params });
    return response.data;
};

export const getTeachingSummary = async (params = {}) => {
    const response = await apiClient.get('attendance/me/teaching/summary', { params });
    return response.data;
};

export const getClassAttendanceByDate = async (classId, date) => {
    const response = await apiClient.get(`attendance/class/${classId}/by-date`, {
        params: { date }
    });
    return response.data;
};

export const getClassStudentsSummary = async (classId, params = {}) => {
    const response = await apiClient.get(`attendance/class/${classId}/students/summary`, { params });
    return response.data;
};

export const getClassStudentsAbsences = async (classId, params = {}) => {
    const response = await apiClient.get(`attendance/class/${classId}/students/absences`, { params });
    return response.data;
};

export const getHomeroomDashboard = async (params = {}) => {
    const response = await apiClient.get('me/homeroom/dashboard', { params });
    return response.data;
};

export const getTeacherSchedules = async (params = {}) => {
    const response = await apiClient.get('schedules', { params });
    return response.data.data ? response.data.data : response.data;
};

export const createManualAttendance = async (data) => {
    const response = await apiClient.post('attendance/manual', data);
    return response.data;
};

export const getAttendanceBySchedule = async (scheduleId) => {
    const response = await apiClient.get(`attendance/schedule/${scheduleId}`);
    return response.data.data ? response.data.data : response.data;
};

export default {
    getMyAttendance,
    getMyAttendanceSummary,
    getTeachingAttendance,
    getTeachingSummary,
    getClassAttendanceByDate,
    getClassStudentsSummary,
    getClassStudentsAbsences,
    getHomeroomDashboard,
    createManualAttendance,
    getTeacherSchedules,
    getAttendanceBySchedule,
    getClassSchedules: async (classId) => {
        const response = await apiClient.get(`classes/${classId}/schedules`);
        return response.data;
    },
    getClassScheduleImage: async (classId) => {
        const response = await apiClient.get(`classes/${classId}/schedule-image`, {
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    }
};
