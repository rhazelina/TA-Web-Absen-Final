import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, ArrowLeft, LogOut, TrendingUp, PieChart, User, Camera } from 'lucide-react';
import './DashboardKelas.css';
import NavbarPengurus from "../../components/PengurusKelas/NavbarPengurus";
import CustomAlert from '../../components/Common/CustomAlert';
import jadwalImage from '../../assets/jadwal.png';
import QRGenerateButton from '../../components/PengurusKelas/QRGenerateButton';
import { getMyAttendanceSummary } from '../../services/attendance';

// Static data
const scheduleImage = jadwalImage;

// SubjectsModal - Menampilkan gambar jadwal yang sudah di-set
const SubjectsModal = ({ isOpen, onClose, scheduleImage = null }) => {
  if (!isOpen) return null;

  return (
    <div className="all-riwayat-modal-overlay" onClick={onClose}>
      <NavbarPengurus />
      <div className="all-riwayat-modal" style={{
        maxWidth: '800px',
        maxHeight: 'calc(100vh - 105px)',
        width: '90%',
        margin: '0 auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div className="all-riwayat-header">
          <button onClick={onClose} className="backbutton">
            <ArrowLeft size={32} />
          </button>
          <h2>Jadwal Pembelajaran</h2>
        </div>

        <div className="all-riwayat-card" style={{
          overflowX: 'auto',
          overflowY: 'auto',
          padding: '24px',
          maxHeight: 'calc(100vh - 205px)'
        }}>
          {scheduleImage ? (
            <div className="modal-image-container">
              <div className="modal-image-box" style={{
                width: '100%',
                maxWidth: '650px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                border: '2px solid #e5e7eb',
                margin: '0 auto'
              }}>
                <img
                  src={scheduleImage}
                  alt="Jadwal Pembelajaran"
                  className="modal-image"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          ) : (
            <div className="modal-empty-state" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', background: '#f9fafb', borderRadius: '16px',
              border: '3px dashed #d1d5db', minHeight: '400px'
            }}>
              <div className="empty-icon-circle" style={{
                width: '120px', height: '120px', borderRadius: '50%', background: '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
              }}>
                <BookOpen size={60} color="#9ca3af" />
              </div>
              <h3 className="empty-title" style={{
                fontSize: '22px', fontWeight: '700', color: '#374151', marginBottom: '12px'
              }}>Belum Ada Jadwal</h3>
              <p className="empty-desc" style={{
                fontSize: '15px', color: '#6b7280', textAlign: 'center', maxWidth: '400px'
              }}>
                Jadwal pembelajaran belum tersedia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Line Chart Component
const LineChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartHeight = 240;
  const chartWidth = 600;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  // Guard: return empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="chart-container-box" style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Belum ada data kehadiran</p>
      </div>
    );
  }

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
    <div className="chart-container-box" style={{ width: '100%', height: 'auto', position: 'relative' }}>
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
            <circle
              cx={point.x}
              cy={point.y}
              r="15"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
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
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          border: '2px solid #3b82f6',
          pointerEvents: 'none',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px',
            textAlign: 'center',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            {hoveredPoint.month}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '600'
            }}>Persentase:</span>
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>{hoveredPoint.percentage}%</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '600'
            }}>Total Hadir:</span>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>{hoveredPoint.hadir}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '600'
            }}>Dari Total:</span>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>{hoveredPoint.total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Donut Chart Component
const DonutChart = ({ data }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="no-data-chart" style={{
        width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f3f4f6', borderRadius: '50%', border: '4px dashed #d1d5db'
      }}>
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af', textAlign: 'center', padding: '0 40px' }}>
          Belum ada data hari ini
        </p>
      </div>
    );
  }

  const percentages = {
    hadir: (data.hadir / total) * 100,
    izin: (data.izin / total) * 100,
    sakit: (data.sakit / total) * 100,
    alpha: (data.alpha / total) * 100,
    terlambat: (data.terlambat / total) * 100,
    pulang: (data.pulang / total) * 100
  };

  const colors = {
    hadir: '#1FA83D',
    izin: '#EDD329',
    sakit: '#9A0898',
    alpha: '#D90000',
    terlambat: '#FF5F1A',
    pulang: '#243CB5'
  };

  const labels = {
    hadir: 'Total Kehadiran',
    izin: 'Total Izin',
    sakit: 'Total Sakit',
    alpha: 'Total Alfa',
    terlambat: 'Total Terlambat',
    pulang: 'Total Pulang'
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
    <div className="chart-donut-wrapper" style={{ width: '180px', height: '180px', position: 'relative' }}>
      <div
        className="chart-donut"
        style={{
          background: `conic-gradient(${gradientStops})`,
          width: '150px',
          height: '150px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          cursor: 'pointer'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredSegment(null)}
      >
        <div className="chart-inner" style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '100px', height: '100px', borderRadius: '50%', background: 'white', pointerEvents: 'none'
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {total}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>
              Total Siswa
            </div>
          </div>
        </div>
      </div>

      {hoveredSegment && (
        <div className="chart-tooltip" style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'white', padding: '12px 16px', borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', display: 'flex', alignItems: 'center',
          gap: '12px', pointerEvents: 'none', zIndex: 10, border: '2px solid #e5e7eb', minWidth: '140px'
        }}>
          <div className="tooltip-color" style={{
            width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
            background: hoveredSegment.color, border: '2px solid rgba(0, 0, 0, 0.15)'
          }}></div>
          <div className="tooltip-content" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="tooltip-label" style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>{hoveredSegment.label}</div>
            <div className="tooltip-value" style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>{hoveredSegment.value} siswa</div>
          </div>
        </div>
      )}
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
    onShowAlert('confirm', 'Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus foto profil?', 'delete_profile');
  };

  return (
    <div className="all-riwayat-modal-overlay" onClick={onClose}>
      <div className="all-riwayat-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="all-riwayat-header">
          <button onClick={onClose} className="backbutton">
            <ArrowLeft size={32} />
          </button>
          <h2>Info Akun</h2>
        </div>

        <div className="all-riwayat-card">
          <div className="profile-modal-card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px',
            padding: '24px', background: '#f9fafb', borderRadius: '16px'
          }}>
            <div className="profile-upload-wrapper" style={{ position: 'relative', marginBottom: '20px' }}>
              <div className="profile-upload-preview" style={{
                width: '150px', height: '150px', borderRadius: '50%', background: '#e8e8e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="profile-upload-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : currentProfileImage ? (
                  <img src={currentProfileImage} alt="Profile" className="profile-upload-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={80} color="#333" />
                )}
              </div>
              <label htmlFor="profile-upload" className={`profile-upload-label ${isUploading ? 'disabled' : ''}`} style={{
                position: 'absolute', bottom: '5px', right: '5px', width: '40px', height: '40px',
                borderRadius: '50%', background: '#1e3a8a', border: '3px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                color: 'white', opacity: isUploading ? 0.5 : 1
              }}>
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

            <div className="profile-action-buttons" style={{ display: 'flex', gap: '12px' }}>
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

          <div className="profile-details-group" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div className="profile-detail-item" style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
              <div className="profile-detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Nama Lengkap</div>
              <div className="profile-detail-value" style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{profile.name}</div>
            </div>

            <div className="profile-detail-item" style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
              <div className="profile-detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Kelas</div>
              <div className="profile-detail-value" style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{profile.kelas}</div>
            </div>

            <div className="profile-detail-item" style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
              <div className="profile-detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Nomor Induk</div>
              <div className="profile-detail-value" style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{profile.id}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            disabled={isUploading}
            className="btn-logout-modal"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '12px', padding: '16px 24px',
              background: isUploading ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '700',
              cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
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
const DashboardKelas = () => {
  const [showSubjects, setShowSubjects] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [profileImage, setProfileImage] = useState(null);

  // Custom Alert State
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'confirm',
    title: '',
    message: '',
    action: null
  });

  // API data states
  const [profile, setProfile] = useState({ name: 'Loading...', kelas: '', id: '' });
  const [dailyStats, setDailyStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0, terlambat: 0, pulang: 0 });
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance summary
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const response = await getMyAttendanceSummary();
        const data = response.data;

        // Set profile
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setProfile({
          name: userData.name || 'Pengurus Kelas',
          kelas: userData.class_name || 'Kelas',
          id: userData.nisn || '-',
        });

        // Transform data for charts
        // Note: Using personal attendance data as placeholder for class data if API not available
        if (data.status_summary) {
          const stats = data.status_summary.reduce((acc, item) => {
            const status = item.status.toLowerCase();
            if (status === 'present') acc.hadir = item.total;
            else if (status === 'excused' || status === 'izin') acc.izin = item.total;
            else if (status === 'sick' || status === 'sakit') acc.sakit = item.total;
            else if (status === 'absent' || status === 'alpha') acc.alpha = item.total;
            else if (status === 'late' || status === 'terlambat') acc.terlambat = item.total;
            return acc;
          }, { hadir: 0, izin: 0, sakit: 0, alpha: 0, terlambat: 0, pulang: 0 });
          setDailyStats(stats);
        }

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
      return;
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

  const totalSubjects = 8; // Or fetch from schedules if available

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
      <NavbarPengurus />
      <div className="dashboard">
        <div className="profile-section">
          <div className="profile-contenty" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="avatar-image" />
                ) : (
                  <div className="avatar-icon">
                    <User size={80} />
                  </div>
                )}
              </div>
            </div>
            <h1 className="profile-name">{profile.name}</h1>
            <h3 className="profile-kelas">{profile.kelas}</h3>
            <p className="profile-id">{profile.id}</p>
          </div>

          <button className="btn-logout" onClick={handleLogoutClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Keluar
          </button>
        </div>

        <main className="dashboard-main">
          <div className="dashboard-grid-main">
            <div className="content-section">
              <div className="kehadiran-card">
                <h3 className="kehadiran-title">Kehadiran Kelas</h3>

                <div className="datetime-info-row">
                  <div className="datetime-badge">
                    <Calendar size={18} />
                    <span>{formatDate()}</span>
                  </div>
                  <div className="datetime-badge">
                    <Clock size={18} />
                    <span>{formatTime()}</span>
                  </div>
                </div>

                <div className="time-range-display">
                  <div className="time-display-box">07:00:00</div>
                  <div className="time-range-separator">—</div>
                  <div className="time-display-box">15:00:00</div>
                </div>
              </div>

              <div className="kehadiran-card">
                <h3 className="kehadiran-title">Mata Pelajaran Hari Ini</h3>

                <div style={{
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '20px',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Total Mata Pelajaran</div>
                    <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{totalSubjects}</div>
                  </div>
                  <BookOpen size={64} style={{ opacity: 0.8 }} />
                </div>

                <button onClick={() => setShowSubjects(true)} className="btn-action" style={{
                  width: '100%', background: 'linear-gradient(135deg, #1e3a8a)',
                  color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                  padding: '16px 20px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  cursor: 'pointer'
                }}>
                  <BookOpen size={20} />
                  <span>Lihat Jadwal Kelas</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="kehadiran-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      padding: '12px', borderRadius: '12px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <TrendingUp color="white" size={24} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      Tren Kehadiran Bulanan
                    </h3>
                  </div>
                  <LineChart data={monthlyTrend} />
                  <div style={{
                    marginTop: '20px', padding: '16px', background: '#f0f9ff',
                    borderRadius: '12px', border: '2px solid #bfdbfe'
                  }}>
                    <p style={{
                      margin: 0, fontSize: '13px', color: '#1e40af',
                      fontWeight: '600', textAlign: 'center'
                    }}>
                      Grafik menunjukkan persentase kehadiran siswa di kelas per bulan
                    </p>
                  </div>
                </div>

                <div className="kehadiran-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      padding: '12px', borderRadius: '12px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <PieChart color="white" size={24} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      Statistik Hari Ini
                    </h3>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '24px',
                    justifyContent: 'center', padding: '10px'
                  }}>
                    <div style={{ flex: '0 0 auto' }}>
                      <DonutChart data={dailyStats} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '1' }}>
                      {[
                        { label: 'Hadir', value: dailyStats.hadir, color: '#1FA83D' },
                        { label: 'Terlambat', value: dailyStats.terlambat, color: '#FF5F1A' },
                        { label: 'Pulang', value: dailyStats.pulang, color: '#243CB5' },
                        { label: 'Izin', value: dailyStats.izin, color: '#EDD329' },
                        { label: 'Sakit', value: dailyStats.sakit, color: '#9A0898' },
                        { label: 'Alpha', value: dailyStats.alpha, color: '#D90000' }
                      ].map((stat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '14px', height: '14px', background: stat.color,
                            borderRadius: '50%', flexShrink: 0
                          }}></div>
                          <div style={{
                            flex: 1, fontSize: '13px', color: '#6b7280', fontWeight: '600'
                          }}>{stat.label}</div>
                          <div style={{
                            fontSize: '20px', color: '#1f2937', fontWeight: 'bold'
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

        {/* QR Generate Button - Floating Action Button */}
        <QRGenerateButton schedules={schedules} />
      </div>
    </>
  );
};

export default DashboardKelas;