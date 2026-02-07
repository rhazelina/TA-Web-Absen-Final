import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardGuru.css';
import NavbarGuru from '../../components/Guru/NavbarGuru';
import { Html5QrcodeScanner } from 'html5-qrcode';
import CustomAlert from '../../components/Common/CustomAlert';
import apiClient from '../../services/api';
import DummyJadwal from '../../assets/images/DummyJadwal.png';

function DashboardGuru() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [qrVerified, setQrVerified] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scannerRef = useRef(null);

  // Schedule Image State
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [jadwalImage, setJadwalImage] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Fetch User Profile & Schedule Image
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('me');
        const user = response.data;
        setUserProfile(user);

        // Check teacherProfile for schedule image
        if (user.teacher_profile?.schedule_image_path || user.teacherProfile?.schedule_image_path) {
          setJadwalImage(user.teacher_profile?.schedule_image_path || user.teacherProfile?.schedule_image_path);
        } else {
          // Fallback: Check homeroom dashboard if specific teacher schedule missing
          try {
            const hrResponse = await apiClient.get('me/homeroom/dashboard');
            if (hrResponse.data?.schedule_image_path) {
              setJadwalImage(hrResponse.data.schedule_image_path);
            }
          } catch (e) { /* Ignore */ }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  // Custom Alert State
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'confirm',
    title: '',
    message: ''
  });

  // State untuk melacak jadwal yang sudah selesai absensi
  const [completedAbsensi, setCompletedAbsensi] = useState(new Set());

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Update time
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes} `);

      // Update date
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();

      setCurrentDate(`${dayName}, ${date} ${monthName} ${year} `);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let scanner = null;
    if (selectedSchedule && !qrVerified) {
      // Gunakan timeout kecil untuk memastikan elemen DOM sudah dirender
      const timer = setTimeout(() => {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        scanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
      }, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode scanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [selectedSchedule, qrVerified]);


  const onScanSuccess = (decodedText, decodedResult) => {
    console.log(`Code matched = ${decodedText} `, decodedResult);
    // Disini bisa ditambahkan validasi data QR jika diperlukan
    handleQrVerified();
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
  };

  const onScanFailure = (error) => {
    // console.warn(`Code scan error = ${ error } `);
  };

  const [allJadwal, setAllJadwal] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // Import dynamically to avoid circular dependency issues if any, or just standard import
        const { getTeacherSchedules } = await import('../../services/attendance');
        const today = new Date().toISOString().split('T')[0];
        const schedules = await getTeacherSchedules({ date: today });

        // Map API response to Component state format
        const mapped = schedules.map(s => ({
          id: s.id,
          mataPelajaran: s.subject_name || s.title || 'Mata Pelajaran',
          jamKe: s.jam_ke || '-', // Backend might return 'jam_ke' or start/end time
          kelas: s.class?.name || 'Kelas',
          classId: s.class_id,
          waktu: `${s.start_time?.slice(0, 5) || ''} - ${s.end_time?.slice(0, 5) || ''}`,
          originalData: s
        }));
        setAllJadwal(mapped);
      } catch (e) {
        console.error("Failed to fetch schedules", e);
        // Fallback or empty
      }
    };
    fetchSchedules();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleIconClick = (jadwal) => {
    setSelectedSchedule(jadwal);
    setQrVerified(false);
  };

  const handleCloseModal = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setSelectedSchedule(null);
    setQrVerified(false);
  };

  const handleQrVerified = () => {
    setQrVerified(true);
  };

  const handleAbsensiSelesai = () => {
    if (selectedSchedule) {
      setCompletedAbsensi(prev => new Set(prev).add(selectedSchedule.id));
    }

    // Format tanggal untuk navigasi
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dayName = days[now.getDay()];
    const formattedDate = `${day} -${month} -${year} (${dayName})`;

    handleCloseModal();

    navigate('/guru/presensi', {
      state: {
        mataPelajaran: selectedSchedule?.mataPelajaran,
        jamKe: selectedSchedule?.jamKe,
        kelas: selectedSchedule?.kelas,
        waktu: selectedSchedule?.waktu,
        tanggal: formattedDate,
        scheduleId: selectedSchedule?.id,
        classId: selectedSchedule?.classId
      }
    });
  };

  const handleLogoutClick = () => {
    setAlertState({
      show: true,
      type: 'confirm',
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari aplikasi?'
    });
  };

  const handleConfirmLogout = () => {
    // Hapus token atau data session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Redirect ke halaman login
    navigate('/login');

    // Optional: bisa tambah alert success logout jika mau, tapi redirect biasanya cukup
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  const renderStatusIcon = (jadwalId) => {
    const isCompleted = completedAbsensi.has(jadwalId);

    if (isCompleted) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="status-icon eye-icon">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C23.27 7.61 19 4.5 12 4.5zm0 13c-3.5 0-6.5-2.5-6.5-5.5S8.5 6.5 12 6.5s6.5 2.5 6.5 5.5-3 5.5-6.5 5.5zm0-8c-1.38 0-2.5.67-2.5 1.5S10.62 13 12 13s2.5-.67 2.5-1.5S13.38 9.5 12 9.5z" />
        </svg>
      );
    }

    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="status-icon qr-icon">
        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2z" />
      </svg>
    );
  };

  return (
    <div className="guru-dashboard-container">
      <NavbarGuru />
      <aside className={`guru-sidebar ${sidebarOpen ? 'open' : 'closed'} `}>
        <div className="guru-profile-card">
          <div className="guru-profile-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="guru-profile-name">{userProfile?.name || 'Guru'}</h2>
          <p className="guru-profile-id">{userProfile?.teacher_profile?.nip || userProfile?.teacherProfile?.nip || userProfile?.username || '-'}</p>

          <button className="guru-btn-logout" onClick={handleLogoutClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`guru-main-content ${sidebarOpen ? '' : 'full-width'} `}>
        <div className="guru-header-section">
          <div className="guru-date-time-card">
            <div className="guru-date-display">
              <span>{currentDate}</span>
              <span className="guru-current-time-small">{currentTime}</span>
            </div>
            <div className="guru-time-range">
              <div className="guru-time-box">07:00:00</div>
              <span className="time-separator">—</span>
              <div className="guru-time-box">15:00:00</div>
            </div>
          </div>

          <div className="guru-current-time-card">
            <div className="guru-class-count">{allJadwal.length} Kelas</div>
          </div>

          <div
            className="guru-current-time-card"
            style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            onClick={() => setShowJadwalModal(true)}
          >
            <div className="guru-total-label">Jadwal Pelajaran</div>
            <div className="guru-class-count" style={{ fontSize: '1.2rem', marginTop: '5px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Lihat Jadwal
            </div>
          </div>
        </div>

        <div className="guru-schedule-section">
          <h2 className="guru-schedule-title">
            Jadwal Hari Ini
            <span className="bell-icon">🔔</span>
          </h2>

          <div className="guru-schedule-list">
            {allJadwal.map((jadwal) => (
              <div key={jadwal.id} className="guru-schedule-card-compact">
                <div className="guru-card-content">
                  <div className="guru-schedule-icon-compact">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                  </div>
                  <div className="guru-schedule-info-compact">
                    <div className="guru-schedule-name">{jadwal.mataPelajaran}</div>
                    <div className="guru-schedule-class">{jadwal.kelas}</div>
                  </div>
                  <button
                    className="guru-btn-qr-compact"
                    onClick={() => handleIconClick(jadwal)}
                  >
                    {renderStatusIcon(jadwal.id)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Jadwal Image */}
      {showJadwalModal && (
        <div className="guru-modal-overlay" onClick={() => setShowJadwalModal(false)}>
          <div className="guru-modal-absen-scan" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="guru-modal-simple-header">
              <h3>Jadwal Pelajaran</h3>
              <button className="guru-close-btn" onClick={() => setShowJadwalModal(false)}>×</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={jadwalImage ? `http://127.0.0.1:8000/storage/${jadwalImage}` : DummyJadwal}
                alt="Jadwal Pelajaran"
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
                onError={(e) => { e.target.src = DummyJadwal; }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Hanya Scan */}
      {selectedSchedule && (
        <div className="guru-modal-overlay" onClick={handleCloseModal}>
          <div
            className={qrVerified ? "guru-modal-absen-detail" : "guru-modal-absen-scan"}
            onClick={(e) => e.stopPropagation()}
          >
            {!qrVerified && (
              <>
                <div className="guru-modal-simple-header">
                  <button className="guru-back-btn" onClick={handleCloseModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                  </button>
                  <h3>Scan</h3>
                  <button className="guru-close-btn" onClick={handleCloseModal}>×</button>
                </div>

                <div className="tab-content-dotted">
                  <div className="guru-scan-area">
                    {/* Scanner container */}
                    <div id="reader" style={{ width: '100%' }}></div>
                    {/* <div className="qr-box-large"> ... </div> */}
                    {/* <button onClick={simulateScanSuccess} className="btn-simulasi">
                      Simulasi Scan Berhasil
                    </button> */}
                  </div>
                </div>
              </>
            )}

            {qrVerified && (
              <>
                <div className="guru-modal-detail-header">
                  <div className="guru-header-left">
                    <div className="guru-header-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                      </svg>
                    </div>
                    <h2>{selectedSchedule.mataPelajaran}</h2>
                  </div>
                  <div className="guru-header-class">{selectedSchedule.kelas}</div>
                </div>

                <div className="guru-modal-detail-body">
                  <h3 className="guru-section-title">Keterangan</h3>

                  <div className="guru-detail-row">
                    <span className="guru-detail-label">Mata Pelajaran</span>
                    <span className="guru-detail-value">{selectedSchedule.mataPelajaran}</span>
                  </div>

                  <div className="guru-detail-row">
                    <span className="guru-detail-label">Kelas/Jurusan</span>
                    <span className="guru-detail-value">{selectedSchedule.kelas}</span>
                  </div>

                  <div className="guru-detail-row">
                    <span className="guru-detail-label">Jam ke-</span>
                    <span className="guru-detail-value">{selectedSchedule.waktu} (Jam ke {selectedSchedule.jamKe})</span>
                  </div>

                  <h3 className="guru-section-title guru-status-title">Status Guru</h3>

                  <div className="guru-detail-row">
                    <span className="guru-detail-label">Hadir</span>
                    <span className="guru-status-badge-green">Hadir</span>
                  </div>

                  <p className="guru-status-description">Anda terjadwal mengajar kelas ini</p>

                  <button className="guru-btn-mulai-absen-full" onClick={handleAbsensiSelesai}>
                    Mulai Presensi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Alert Component */}
      <CustomAlert
        isOpen={alertState.show}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirmLogout}
        confirmLabel="Ya, Keluar"
        cancelLabel="Kembali"
      />
    </div>
  );
}

export default DashboardGuru;