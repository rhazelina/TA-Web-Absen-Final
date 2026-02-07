import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './Dashboard.css';

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState({
    totalMurid: 0,
    totalGuru: 0,
    totalKelas: 0,
    totalJurusan: 0
  });

  const [attendanceData, setAttendanceData] = useState({
    tepatWaktu: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpha: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { default: apiClient } = await import('../../services/api');
        const { API_ENDPOINTS } = await import('../../utils/constants');

        // Fetch Admin Summary
        // If endpoint doesn't exist, we might need to fetch individual lists, 
        // but assuming admin/summary is or will be implemented for this view.
        // Fallback to individual fetches if summary fails or is empty?

        try {
          const response = await apiClient.get(API_ENDPOINTS.ADMIN_SUMMARY);
          const data = response.data.data || response.data;

          if (data) {
            setStats({
              totalMurid: data.total_students || 0,
              totalGuru: data.total_teachers || 0,
              totalKelas: data.total_classes || 0,
              totalJurusan: data.total_majors || 6 // Fallback if not provided
            });

            if (data.attendance_stats) {
              setAttendanceData({
                tepatWaktu: data.attendance_stats.present || 0,
                terlambat: data.attendance_stats.late || 0,
                izin: data.attendance_stats.excused || 0,
                sakit: data.attendance_stats.sick || 0,
                alpha: data.attendance_stats.absent || 0
              });
            }
          }
        } catch (e) {
          // Fallback: Fetch counts manually if summary endpoint missing
          console.warn("Summary endpoint failed, fetching manually...", e);

          const [studentsRes, teachersRes, classesRes] = await Promise.all([
            apiClient.get(API_ENDPOINTS.STUDENTS),
            apiClient.get(API_ENDPOINTS.TEACHERS),
            apiClient.get('classes')
          ]);

          const sCount = (studentsRes.data.data || studentsRes.data).length;
          const tCount = (teachersRes.data.data || teachersRes.data).length;
          const cList = (classesRes.data.data || classesRes.data);
          const cCount = cList.length;
          const jCount = new Set(cList.map(c => c.major)).size;

          setStats({
            totalMurid: sCount,
            totalGuru: tCount,
            totalKelas: cCount,
            totalJurusan: jCount
          });
        }

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="dashboard-wrapper">
      <NavbarAdmin />

      <div className="dashboard-content">
        {/* JARAK SUDAH DITURUNKAN */}
        <div className="dashboard-header-section">
          <h1 className="page-title">Statistik Sekolah</h1>
        </div>

        {/* STAT CARDS */}
        <div className="stats-cards-grid">
          <div className="stat-card-item card-blue">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalMurid}</div>
            <div className="stat-label">Total Murid</div>
          </div>

          <div className="stat-card-item card-orange">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalGuru}</div>
            <div className="stat-label">Total Guru</div>
          </div>

          <div className="stat-card-item card-cyan">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalKelas}</div>
            <div className="stat-label">Total Rombel</div>
          </div>

          <div className="stat-card-item card-gray">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalJurusan}</div>
            <div className="stat-label">Total Konsentrasi Keahlian</div>
          </div>
        </div>

        {/* RIWAYAT KEHADIRAN */}
        <div className="attendance-wrapper">
          <h2 className="attendance-title">Riwayat Kehadiran (Hari Ini)</h2>

          <div className="attendance-grid">
            <div className="attendance-left">
              <div className="date-time-box">
                <div className="date-label">{formatDate(currentTime)}</div>
                <div className="time-label">{formatTime(currentTime)}</div>
              </div>

              <div className="time-range-box">
                <button className="time-range-btn">07:00:00</button>
                <span className="time-separator">—</span>
                <button className="time-range-btn">15:00:00</button>
              </div>
            </div>

            <div className="attendance-right">
              <div className="attendance-stats-row">
                <div className="attendance-stat-label">Tepat Waktu</div>
                <div className="attendance-stat-label">Terlambat</div>
                <div className="attendance-stat-label">Izin</div>
                <div className="attendance-stat-label">Sakit</div>
                <div className="attendance-stat-label">Alpha</div>
              </div>

              <div className="attendance-numbers-row">
                <div className="attendance-number-box">{attendanceData.tepatWaktu}</div>
                <div className="attendance-number-box">{attendanceData.terlambat}</div>
                <div className="attendance-number-box">{attendanceData.izin}</div>
                <div className="attendance-number-box">{attendanceData.sakit}</div>
                <div className="attendance-number-box">{attendanceData.alpha}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
