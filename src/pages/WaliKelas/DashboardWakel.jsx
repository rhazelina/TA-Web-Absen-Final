import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';

import CustomAlert from '../../components/Common/CustomAlert';
import { getHomeroomDashboard } from '../../services/attendance';

const DashboardWakel = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Custom Alert State
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'confirm',
    title: '',
    message: ''
  });

  // Data Initial State (Loading)
  const [waliKelas, setWaliKelas] = useState({
    nama: "Loading...",
    nip: "",
    role: "Wali Kelas"
  });

  const [scheduleData, setScheduleData] = useState([]);

  const [stats, setStats] = useState({
    totalKelas: 0,
    totalSiswa: 0
  });

  const [completedAbsensi, setCompletedAbsensi] = useState(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch API Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        // Fetch dashboard summary
        const dashboardData = await getHomeroomDashboard();

        // Update states
        setWaliKelas({
          nama: userData.name || 'Guru',
          nip: userData.nip || '-',
          role: `Wali Kelas ${dashboardData.className || ''}`
        });

        // Map schedules from API
        if (dashboardData.schedules) {
          const formattedSchedules = dashboardData.schedules.map(s => ({
            id: s.id,
            mataPelajaran: s.subject_name,
            kelas: s.class_name,
            jamKe: s.time_slot,
            waktu: `${s.start_time} - ${s.end_time}`
          }));
          setScheduleData(formattedSchedules);
        }

        // Update stats
        setStats({
          totalKelas: dashboardData.total_classes || 0,
          totalSiswa: dashboardData.total_students || 0
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleIconClick = (jadwal) => {
    setSelectedSchedule(jadwal);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
  };

  const handleAbsensiSelesai = () => {
    if (!selectedSchedule) {
      console.error('❌ No schedule selected');
      return;
    }

    console.log('=== MULAI NAVIGASI KE PRESENSI SISWA ===');
    console.log('✅ Selected schedule:', selectedSchedule);

    const dataToSend = {
      mataPelajaran: selectedSchedule.mataPelajaran,
      jamKe: selectedSchedule.jamKe,
      kelas: selectedSchedule.kelas,
      waktu: selectedSchedule.waktu,
      tanggal: formatDate(currentTime),
    };

    console.log('📦 Data yang akan dikirim:', dataToSend);

    // Update completed status
    setCompletedAbsensi((prev) => new Set([...prev, selectedSchedule.id]));

    // Simpan ke sessionStorage sebagai backup
    sessionStorage.setItem('presensiData', JSON.stringify(dataToSend));
    console.log('💾 Data disimpan ke sessionStorage');

    // Tutup modal
    handleCloseModal();

    // Navigate ke PresensiSiswa
    setTimeout(() => {
      console.log('🚀 Navigasi ke /presensi-siswa...');
      navigate('/walikelas/presensi', { state: dataToSend });
      console.log('✅ Navigate dipanggil!');
    }, 100);
  };

  const handleLogoutClick = () => {
    setAlertState({
      show: true,
      type: 'confirm',
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar?'
    });
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login');
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  const renderStatusIcon = (jadwalId) => {
    const isCompleted = completedAbsensi.has(jadwalId);

    if (isCompleted) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="wakel-action-icon eye-icon">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C23.27 7.61 19 4.5 12 4.5zm0 13c-3.5 0-6.5-2.5-6.5-5.5S8.5 6.5 12 6.5s6.5 2.5 6.5 5.5-3 5.5-6.5 5.5zm0-8c-1.38 0-2.5.67-2.5 1.5S10.62 13 12 13s2.5-.67 2.5-1.5S13.38 9.5 12 9.5z" />
        </svg>
      );
    }

    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="wakel-action-icon">
        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2z" />
      </svg>
    );
  };

  return (
    <div className="wakel-dashboard-page">
      <NavbarWakel />
      <div className="wakel-circle-decoration wakel-circle-left-bottom"></div>
      <div className="wakel-circle-decoration wakel-circle-right-top"></div>

      <div className="wakel-dashboard-container">

        <div className="left-section">
          <div className="wakel-profile-section">
            <div className="wakel-profile-content">
              <div className="wakel-profile-avatar-wrapper">
                <div className="wakel-profile-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              <div className="wakel-profile-info">
                <h2 className="wakel-profile-name">{waliKelas.nama}</h2>
                <p className="wakel-profile-nip">{waliKelas.nip}</p>
              </div>
              <button className="wakel-btn-logout" onClick={handleLogoutClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>

        <div className="wakel-right-section">
          {/* HEADER SECTION - Kehadiran Siswa */}
          <div className="wakel-header-section">
            <h2 className="wakel-header-title">Kehadiran Siswa</h2>

            {/* TOP CARDS GRID */}
            <div className="wakel-top-cards-grid">

              {/* CARD TANGGAL & JAM */}
              <div className="wakel-datetime-card wakel-figma-style">
                <div className="wakel-datetime-left">
                  <svg className="wakel-datetime-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  <div>
                    <p className="wakel-datetime-label">{formatDate(currentTime)}</p>
                    <p className="wakel-datetime-static">07:00 - 15:00</p>
                  </div>
                </div>

                <div className="wakel-datetime-right">
                  <p className="wakel-datetime-clock">{formatTime(currentTime)}</p>
                </div>
              </div>

              {/* TOTAL MENGAJAR */}
              <div className="wakel-stats-card">
                <p className="wakel-stats-label">Total Mengajar Hari Ini</p>
                <p className="wakel-stats-value">{stats.totalKelas} Kelas</p>
              </div>

              {/* TOTAL SISWA (BISA DI KLIK) */}
              <div
                className="wakel-stats-card clickable"
                onClick={() => {
                  console.log('Navigating to datasiswa...');
                  navigate('/walikelas/datasiswa');
                }}
              >
                <p className="wakel-stats-label">Total Siswa</p>
                <p className="wakel-stats-value">{stats.totalSiswa}</p>
              </div>

            </div>

          </div>

          {/* JADWAL SECTION */}
          <div className="wakel-jadwal-section">
            <h3 className="wakel-jadwal-title">Jadwal Hari Ini</h3>

            <div className="wakel-schedule-list">
              {scheduleData.length > 0 ? (
                scheduleData.map((item) => (
                  <div key={item.id} className="wakel-schedule-item" onClick={() => handleIconClick(item)}>
                    <div className="wakel-schedule-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                      </svg>
                    </div>
                    <div className="wakel-schedule-info">
                      <p className="wakel-schedule-subject">{item.mataPelajaran}</p>
                      <p className="wakel-schedule-details">
                        {item.kelas} | Jam ke {item.jamKe} | {item.waktu}
                      </p>
                    </div>
                    <button className="wakel-schedule-action">
                      {renderStatusIcon(item.id)}
                    </button>
                  </div>
                ))
              ) : (
                <div className="wakel-empty-schedule">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                  </svg>
                  <p>Tidak ada jadwal mengajar hari ini</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL */}
      {selectedSchedule && (
        <div className="wakel-modal-overlay" onClick={handleCloseModal}>
          <div className="wakel-modal-absen-detail" onClick={(e) => e.stopPropagation()}>
            <div className="wakel-modal-subject-header">
              <div className="wakel-subject-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>
              <div className="wakel-subject-title">
                <h2>{selectedSchedule.mataPelajaran}</h2>
              </div>
              <div className="wakel-subject-class">{selectedSchedule.kelas}</div>
            </div>

            <div className="wakel-schedule-info-section">
              <h3>Keterangan</h3>
              <div className="info-table">
                <div className="wakel-info-row">
                  <span className="label">Mata Pelajaran</span>
                  <span className="value">{selectedSchedule.mataPelajaran}</span>
                </div>
                <div className="wakel-info-row">
                  <span className="label">Kelas/Jurusan</span>
                  <span className="value">{selectedSchedule.kelas}</span>
                </div>
                <div className="wakel-info-row">
                  <span className="label">Jam ke-</span>
                  <span className="value">{selectedSchedule.waktu} (Jam ke {selectedSchedule.jamKe})</span>
                </div>
              </div>
            </div>

            <div className="wakel-status-section">
              <div className="wakel-status-left">
                <div className="wakel-status-header">
                  <h3>Status Guru</h3>
                  <span className="wakel-status-badge hadir">Hadir</span>
                </div>
                <p>Anda terjadwal mengajar kelas ini</p>
              </div>
              <button className="wakel-btn-mulai-absensi" onClick={handleAbsensiSelesai}>
                Mulai Presensi
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomAlert
        isOpen={alertState.show}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirmLogout}
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
      />
    </div>
  );
};

export default DashboardWakel;