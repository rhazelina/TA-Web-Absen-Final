export const STATUS_BACKEND_TO_FRONTEND = {
    present: 'Hadir',
    late: 'Terlambat',
    excused: 'Izin',
    sick: 'Sakit',
    absent: 'Alpha',
    dinas: 'Dinas',
    izin: 'Izin'
};

export const STATUS_FRONTEND_TO_BACKEND = {
    'hadir': 'present',
    'terlambat': 'late',
    'izin': 'izin',
    'sakit': 'sick',
    'alpha': 'absent',
    'dinas': 'dinas',
    'pulang': 'izin',

    // Title Case variants just in case
    'Hadir': 'present',
    'Terlambat': 'late',
    'Izin': 'izin',
    'Sakit': 'sick',
    'Alpha': 'absent',
    'Dinas': 'dinas',
    'Pulang': 'izin'
};

export const STATUS_COLORS = {
    present: 'status-hadir',
    late: 'status-terlambat',
    excused: 'status-izin',
    sick: 'status-sakit',
    absent: 'status-alpha',
    dinas: 'status-dinas',
    izin: 'status-izin'
};

export const STATUS_COLORS_HEX = {
    present: '#1FA83D',
    late: '#FFA500',
    excused: '#ACA40D',
    sick: '#520C8F',
    absent: '#D90000',
    dinas: '#0000FF',
    izin: '#ACA40D',
    // Indonesian keys for local components that might need them
    hadir: '#1FA83D',
    terlambat: '#FFA500',
    izin: '#ACA40D',
    sakit: '#520C8F',
    alpha: '#D90000',
    dinas: '#0000FF',
    pulang: '#2F85EB'
};
