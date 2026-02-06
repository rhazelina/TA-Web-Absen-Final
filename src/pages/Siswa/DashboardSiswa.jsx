import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, ArrowLeft, LogOut, PieChart, TrendingUp, User, Camera } from 'lucide-react';
import './DashboardSiswa.css';
import NavbarSiswa from '../../components/Siswa/NavbarSiswa';
import CustomAlert from '../../components/Common/CustomAlert';
import jadwalImage from '../../assets/jadwal.png'; // IMPORT GAMBAR JADWAL
import QRScanButton from '../../components/Siswa/QRScanButton';
import { getMyAttendanceSummary } from '../../services/attendance';

// Static data for schedule image
const scheduleImage = jadwalImage;

// Subjects Modal - Menampilkan gambar jadwal
const SubjectsModal = ({ isOpen, onClose, scheduleImage = null }) => {
  if (!isOpen) return null;

  return (
    <div className="siswa-overlay-modal-semua-riwayat" onClick={onClose}>
      <NavbarSiswa />
      <div className="siswa-modal-wrapper-custom" onClick={(e) => e.stopPropagation()}>
        <div className="siswa-header-semua-riwayat">
          <button onClick={onClose} className="siswa-tombol-kembali">
            <ArrowLeft size={32} />
          </button>
          <h2>Jadwal Pembelajaran</h2>
        </div>

        <div className="siswa-modal-content-scrollable">
          {scheduleImage ? (
            <div className="siswa-modal-image-container">
              <div className="siswa-modal-image-box">
                <img
                  src={scheduleImage}
                  alt="Jadwal Pembelajaran"
                  className="siswa-modal-image"
                />
              </div>
            </div>
          ) : (
            <div className="siswa-modal-empty-state">
              <div className="siswa-empty-icon-circle">
                <BookOpen size={60} color="#9ca3af" />
              </div>

              <h3 className="siswa-empty-title">Belum Ada Jadwal</h3>

              <p className="siswa-empty-desc">
                Jadwal pembelajaran belum tersedia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Line Chart Component - Untuk tren kehadiran bulanan pribadi siswa
const LineChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Guard: return empty state if no data
  if (!data || data.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        Loading data...
      </div>
    );
  }

  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const maxValue = Math.max(...data.map(d => d.percentage));
  const minValue = Math.min(...data.map(d => d.percentage));
  const range = maxValue - minValue || 10;

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = padding.top + ((maxValue + 5 - item.percentage) / (range + 10)) * (chartHeight - padding.top - padding.bottom);
    return { x, y, ...item };
  });

  // Create path string for the line
  const linePath = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Create path for the gradient fill area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

  return (
    <div className="siswa-chart-container-box" style={{ width: '100%', height: '400px' }}>
      <div className="siswa-chart-header">
        <div className="siswa-chart-title-group">
          <div className="siswa-chart-icon-box">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="siswa-chart-title">Tren Kehadiran</h3>
            <p className="siswa-chart-subtitle">Statistik Bulanan</p>
          </div>
        </div>
        {/* Simple Legend for Line Chart */}
        <div className="siswa-lencana-waktu">
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>• Persentase</span>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '300px' }}>
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + ((100 - val) / 100) * (chartHeight - padding.top - padding.bottom);
            return (
              <line
                key={val}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + ((100 - val) / 100) * (chartHeight - padding.top - padding.bottom);
            return (
              <text
                key={val}
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {val}%
              </text>
            );
          })}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#lineGradient)"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke="#3b82f6"
                strokeWidth="3"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Larger invisible circle for easier hovering */}
              <circle
                cx={point.x}
                cy={point.y}
                r="15"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Value label above point */}
              <text
                x={point.x}
                y={point.y - 15}
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fill="#1f2937"
              >
                {point.percentage}%
              </text>
              {/* Month label below chart */}
              <text
                x={point.x}
                y={chartHeight - padding.bottom + 25}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill="#6b7280"
              >
                {point.month}
              </text>
            </g>
          ))}

          {/* Trend indicator */}
          {points.length > 1 && (
            <g>
              {(() => {
                const firstPoint = points[0];
                const lastPoint = points[points.length - 1];
                const trend = lastPoint.percentage - firstPoint.percentage;
                const trendColor = trend >= 0 ? '#22c55e' : '#ef4444';
                const trendText = trend >= 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`;

                return (
                  <text
                    x={chartWidth - padding.right}
                    y={padding.top - 10}
                    textAnchor="end"
                    fontSize="14"
                    fontWeight="bold"
                    fill={trendColor}
                  >
                    {trendText} {trend >= 0 ? '↑' : '↓'}
                  </text>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Tooltip for hovered point */}
        {hoveredPoint && (
          <div className="siswa-tooltip-chart" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' }}>
            <div className="siswa-header-tooltip" style={{ marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', textAlign: 'center', fontWeight: 'bold' }}>
              {hoveredPoint.month}
            </div>
            <div className="siswa-konten-tooltip">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <span className="siswa-label-tooltip">Persentase:</span>
                <span className="siswa-nilai-tooltip" style={{ fontSize: '16px', color: '#3b82f6' }}>{hoveredPoint.percentage}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <span className="siswa-label-tooltip">Hadir:</span>
                <span className="siswa-nilai-tooltip" style={{ fontSize: '14px' }}>{hoveredPoint.hadir} hari</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <span className="siswa-label-tooltip">Total:</span>
                <span className="siswa-nilai-tooltip" style={{ fontSize: '14px' }}>{hoveredPoint.total} hari</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Donut Chart Component - Untuk statistik kehadiran mingguan
const DonutChart = ({ data = {} }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Guard: check if data is valid
  if (!data || typeof data !== 'object') {
    return (
      <div style={{
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        Loading data...
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

  if (total === 0) {
    return (
      <div className="siswa-chart-tidak-ada-data">
        <p>Belum ada data minggu ini</p>
      </div>
    );
  }

  const percentages = {
    hadir: (data.hadir / total) * 100,
    izin: (data.izin / total) * 100,
    sakit: (data.sakit / total) * 100,
    alpha: (data.alpha / total) * 100
  };

  const colors = {
    hadir: '#22c55e',
    izin: '#eab308',
    sakit: '#8b5cf6',
    alpha: '#ef4444'
  };

  const labels = {
    hadir: 'Hadir',
    izin: 'Izin',
    sakit: 'Sakit',
    alpha: 'Alpha'
  };

  let cumulativePercent = 0;
  const gradientStops = Object.keys(percentages).map(key => {
    const start = cumulativePercent;
    cumulativePercent += percentages[key];
    return `${colors[key]} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  const handleMouseMove = (e) => {
    const chart = e.currentTarget;
    const rect = chart.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const normalizedAngle = (angle + 90 + 360) % 360;

    const outerRadius = 75;
    const innerRadius = 50;
    const distance = Math.sqrt(x * x + y * y);

    if (distance >= innerRadius && distance <= outerRadius) {
      let cumulative = 0;
      for (const [key, percent] of Object.entries(percentages)) {
        cumulative += percent;
        if (normalizedAngle < (cumulative / 100) * 360) {
          setHoveredSegment({ label: labels[key], value: data[key], color: colors[key] });
          break;
        }
      }
    } else {
      setHoveredSegment(null);
    }
  };

  return (
    <div className="siswa-chart-container-box" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 className="siswa-chart-title" style={{ marginBottom: '24px', alignSelf: 'flex-start' }}>Status Mingguan</h3>

      <div className="siswa-pembungkus-chart-donut">
        <div
          className="siswa-chart-donut"
          style={{
            background: `conic-gradient(${gradientStops})`
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div className="siswa-dalam-chart">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {total}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>
                Total Hari
              </div>
            </div>
          </div>
        </div>

        {hoveredSegment && (
          <div className="siswa-tooltip-chart">
            <div className="siswa-warna-tooltip" style={{ background: hoveredSegment.color }}></div>
            <div className="siswa-konten-tooltip">
              <div className="siswa-label-tooltip">{hoveredSegment.label}</div>
              <div className="siswa-nilai-tooltip">{hoveredSegment.value} hari</div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px', width: '100%' }}>
        {Object.entries(data).map(([key, value], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[key] }}></div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>{labels[key]}</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ isOpen, onClose, profile, onLogout, currentProfileImage, onUpdateProfileImage, onShowAlert }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        onShowAlert('warning', 'Peringatan', 'File harus berupa gambar!');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        onShowAlert('warning', 'Peringatan', 'Ukuran file maksimal 5MB!');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!profileImage) return;

    setIsUploading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdateProfileImage(previewImage);
      setPreviewImage(null);
      setProfileImage(null);
      onShowAlert('success', 'Berhasil', 'Foto profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error uploading image:', error);
      onShowAlert('error', 'Gagal', 'Gagal mengupload foto. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setProfileImage(null);
  };

  const handleDeleteProfileImage = async () => {
    // Trigger confirm alert via parent
    onShowAlert('confirm', 'Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus foto profil?', 'delete_profile');
  };

  return (
    <div className="siswa-overlay-modal-semua-riwayat" onClick={onClose}>
      <div className="siswa-modal-wrapper-custom" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="siswa-header-semua-riwayat">
          <button onClick={onClose} className="siswa-tombol-kembali">
            <ArrowLeft size={32} />
          </button>
          <h2>Info Akun</h2>
        </div>

        <div className="siswa-modal-content-scrollable">
          <div className="profile-modal-card">
            <div className="profile-upload-wrapper">
              <div className="profile-upload-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="profile-upload-img" />
                ) : currentProfileImage ? (
                  <img src={currentProfileImage} alt="Profile" className="profile-upload-img" />
                ) : (
                  <User size={80} color="#333" />
                )}
              </div>
              <label htmlFor="profile-upload" className={`profile-upload-label ${isUploading ? 'disabled' : ''}`}>
                <Camera size={20} />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </div>

            <div className="profile-action-buttons">
              {previewImage ? (
                <>
                  <button
                    onClick={handleSaveImage}
                    disabled={isUploading}
                    className="btn-save-photo"
                  >
                    {isUploading ? 'Menyimpan...' : 'Simpan Foto'}
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="btn-cancel-photo"
                  >
                    Batal
                  </button>
                </>
              ) : currentProfileImage && (
                <button
                  onClick={handleDeleteProfileImage}
                  disabled={isUploading}
                  className="btn-delete-photo"
                >
                  {isUploading ? 'Menghapus...' : 'Hapus Foto'}
                </button>
              )}
            </div>
          </div>

          <div className="profile-details-group">
            <div className="profile-detail-item">
              <div className="profile-detail-label">Nama Lengkap</div>
              <div className="profile-detail-value">{profile.name}</div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-detail-label">Kelas</div>
              <div className="profile-detail-value">{profile.kelas}</div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-detail-label">Nomor Induk Siswa</div>
              <div className="profile-detail-value">{profile.id}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            disabled={isUploading}
            className="btn-logout-modal"
          >
            <LogOut size={20} />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard
const Dashboard = () => {
  const [showSubjects, setShowSubjects] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [profileImage, setProfileImage] = useState(null);
  const [alertState, setAlertState] = useState({
    show: false,
    type: '',
    title: '',
    message: '',
    action: null
  });

  // API data states
  const [profile, setProfile] = useState({ name: 'Loading...', kelas: '', id: '' });
  const [weeklyStats, setWeeklyStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0 });
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance summary from API
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const response = await getMyAttendanceSummary();
        const data = response.data;

        // Set profile from user data
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setProfile({
          name: userData.name || 'Siswa',
          kelas: userData.class_name || '',
          id: userData.nisn || ''
        });

        // Transform status summary to weekly stats
        if (data.status_summary) {
          const stats = data.status_summary.reduce((acc, item) => {
            const status = item.status.toLowerCase();
            if (status === 'present') acc.hadir = item.total;
            else if (status === 'excused' || status === 'izin') acc.izin = item.total;
            else if (status === 'sick' || status === 'sakit') acc.sakit = item.total;
            else if (status === 'absent' || status === 'alpha') acc.alpha = item.total;
            return acc;
          }, { hadir: 0, izin: 0, sakit: 0, alpha: 0 });
          setWeeklyStats(stats);
        }

        // Transform daily summary to monthly trend
        if (data.daily_summary) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const monthlyData = {};

          data.daily_summary.forEach((item) => {
            const date = new Date(item.day);
            const monthKey = monthNames[date.getMonth()];

            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { month: monthKey, hadir: 0, total: 0 };
            }

            monthlyData[monthKey].total += item.total;
            if (item.status.toLowerCase() === 'present') {
              monthlyData[monthKey].hadir += item.total;
            }
          });

          // Calculate percentage and take last 6 months
          const monthlyArray = Object.values(monthlyData).map(m => ({
            ...m,
            percentage: m.total > 0 ? Math.round((m.hadir / m.total) * 100) : 0
          }));
          setMonthlyTrend(monthlyArray.slice(-6));
        }
      } catch (error) {
        console.error('Error fetching attendance summary:', error);
      }
    };

    fetchAttendanceSummary();
  }, []);

  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[currentDateTime.getDay()]}, ${currentDateTime.getDate()} ${months[currentDateTime.getMonth()]} ${currentDateTime.getFullYear()}`;
  };

  const formatTime = () => {
    return currentDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleLogoutClick = () => {
    setAlertState({
      show: true,
      type: 'confirm',
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar?',
      action: 'logout'
    });
  };

  const handleConfirmAction = () => {
    if (alertState.action === 'logout') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      window.location.href = '/';
    } else if (alertState.action === 'delete_profile') {
      handleUpdateProfileImage(null);
      setAlertState({
        show: true,
        type: 'success',
        title: 'Berhasil',
        message: 'Foto profil berhasil dihapus!',
        action: null
      });
      return; // Don't close immediately, let user see success
    }
    closeAlert();
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  const handleUpdateProfileImage = (newImageUrl) => {
    setProfileImage(newImageUrl);
  };

  const onShowAlert = (type, title, message, action = null) => {
    setAlertState({
      show: true,
      type,
      title,
      message,
      action
    });
  };

  const totalSubjects = 8;

  return (
    <>
      <CustomAlert
        isOpen={alertState.show}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirmAction}
        confirmLabel={alertState.action === 'logout' || alertState.action === 'delete_profile' ? "Ya" : "Oke"}
        cancelLabel="Batal"
      />
      <NavbarSiswa />
      <div className="siswa-dashboard-utama">
        <div className="siswa-bagian-profil">
          <div className="siswa-konten-profil" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
            <div className="siswa-pembungkus-avatar">
              <div className="siswa-avatar-profil">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="siswa-gambar-avatar"
                  />
                ) : (
                  <div className="siswa-ikon-avatar">
                    <User size={80} />
                  </div>
                )}
              </div>
            </div>
            <h1 className="siswa-nama-profil">{profile.name}</h1>
            <h3 className="siswa-kelas-profil">{profile.kelas}</h3>
            <p className="siswa-id-profil">{profile.id}</p>
          </div>

          <button className="btn-logout" onClick={handleLogoutClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Keluar
          </button>
        </div>

        <main className="siswa-dashboard-konten">
          <div className="siswa-dashboard-grid">
            <div className="siswa-bagian-konten">
              <div className="siswa-kartu-kehadiran">
                <h3 className="siswa-judul-kehadiran">Kehadiran Siswa</h3>

                <div className="siswa-baris-info-waktu">
                  <div className="siswa-lencana-waktu">
                    <Calendar size={18} />
                    <span>{formatDate()}</span>
                  </div>
                  <div className="siswa-lencana-waktu">
                    <Clock size={18} />
                    <span>{formatTime()}</span>
                  </div>
                </div>

                <div className="siswa-tampilan-rentang-waktu">
                  <div className="siswa-kotak-tampilan-waktu">07:00:00</div>
                  <div className="siswa-pemisah-rentang-waktu">—</div>
                  <div className="siswa-kotak-tampilan-waktu">15:00:00</div>
                </div>
              </div>

              <div className="siswa-kartu-kehadiran">
                <h3 className="siswa-judul-kehadiran">Mata Pelajaran Hari Ini</h3>

                <div style={{
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '16px',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Total Mata Pelajaran</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalSubjects}</div>
                  </div>
                  <BookOpen size={48} style={{ opacity: 0.8 }} />
                </div>

                <button
                  onClick={() => setShowSubjects(true)}
                  className="siswa-btn-lihat-jadwal"
                >
                  <BookOpen size={20} />
                  <span>Lihat Jadwal Kelas</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="siswa-kartu-kehadiran">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TrendingUp color="white" size={24} />
                    </div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: 0
                    }}>Tren Kehadiran Bulanan</h3>
                  </div>
                  <LineChart data={monthlyTrend} />
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: '#f0f9ff',
                    borderRadius: '12px',
                    border: '2px solid #bfdbfe'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#1e40af',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      Grafik menunjukkan persentase kehadiran pribadi per bulan
                    </p>
                  </div>
                </div>

                <div className="siswa-kartu-kehadiran">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PieChart color="white" size={24} />
                    </div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: 0
                    }}>Statistik Minggu Ini</h3>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    justifyContent: 'center',
                    padding: '10px'
                  }}>
                    <div style={{ flex: '0 0 auto' }}>
                      <DonutChart data={weeklyStats} />
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      flex: '1'
                    }}>
                      {[
                        { label: 'Hadir', value: weeklyStats.hadir, color: '#22c55e' },
                        { label: 'Izin', value: weeklyStats.izin, color: '#eab308' },
                        { label: 'Sakit', value: weeklyStats.sakit, color: '#8b5cf6' },
                        { label: 'Alpha', value: weeklyStats.alpha, color: '#ef4444' }
                      ].map((stat, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            background: stat.color,
                            borderRadius: '50%',
                            flexShrink: 0
                          }}></div>
                          <div style={{
                            flex: 1,
                            fontSize: '13px',
                            color: '#6b7280',
                            fontWeight: '600'
                          }}>{stat.label}</div>
                          <div style={{
                            fontSize: '20px',
                            color: '#1f2937',
                            fontWeight: 'bold'
                          }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SubjectsModal
          isOpen={showSubjects}
          onClose={() => setShowSubjects(false)}
          scheduleImage={scheduleImage}
        />

        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          profile={profile}
          currentProfileImage={profileImage}
          onUpdateProfileImage={handleUpdateProfileImage}
          onLogout={handleLogoutClick}
          onShowAlert={onShowAlert}
        />

        {/* QR Scan Button - Floating Action Button */}
        <QRScanButton onSuccess={() => {
          // Refresh page after successful scan
          window.location.reload();
        }} />
      </div>
    </>
  );
};

export default Dashboard;