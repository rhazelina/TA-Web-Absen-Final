// Riwayat.jsx - Fixed version with unique class names
import React, { useState, useEffect } from 'react';
import { Calendar, Eye, X, ZoomIn } from 'lucide-react';
import './Riwayat.css';
import NavbarSiswa from '../../components/Siswa/NavbarSiswa';

// Data Dummy Removed
const dummyAttendanceRecords = [];

function Riwayat() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk date range
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  // Calculate end date (e.g., end of month or same day) - let's set it to today for now
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Need to adjust default range? Maybe last 30 days.
  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAttendance();
  }, [startDate, endDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { default: attendanceService } = await import('../../services/attendance');
      const { STATUS_BACKEND_TO_FRONTEND, STATUS_COLORS } = await import('../../utils/statusMapping');

      // Use getMyAttendance endpoint
      // It supports 'from' and 'to' query params
      const response = await attendanceService.getMyAttendance({
        from: startDate,
        to: endDate
      });

      const data = response.data || response; // Handle pagination if needed (data.data)
      const records = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

      const mapped = records.map(r => {
        const dateObj = new Date(r.date);
        const displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getFullYear()).slice(-2)}`;

        const statusLabel = STATUS_BACKEND_TO_FRONTEND[r.status] || r.status;
        const statusColor = STATUS_COLORS[r.status] || 'status-hadir';

        return {
          id: r.id,
          recordDate: r.date.split('T')[0], // YYYY-MM-DD
          date: displayDate, // DD/MM/YY
          period: r.schedule ? `${r.schedule.start_time?.slice(0, 5)}-${r.schedule.end_time?.slice(0, 5)}` : '-',
          subject: r.schedule?.subject_name || r.schedule?.class?.label || '-', // Fallback
          teacher: r.schedule?.teacher?.user?.name || '-',
          status: statusLabel,
          statusColor: statusColor,
          reason: r.reason,
          proofDocument: null, // Backend doesn't seem to return proof url in simple index?
          proofImage: null
        };
      });
      setAttendanceRecords(mapped);

    } catch (e) {
      console.error("Failed to fetch attendance:", e);
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal untuk ditampilkan dengan format dd/mm/yy
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Handle start date change dengan validasi
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Jika tanggal akhir lebih kecil dari tanggal awal yang baru, update tanggal akhir
    if (new Date(endDate) < new Date(newStartDate)) {
      setEndDate(newStartDate);
    }
  };

  // Handle end date change dengan validasi
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    // Hanya update jika tanggal akhir >= tanggal awal
    if (new Date(newEndDate) >= new Date(startDate)) {
      setEndDate(newEndDate);
    }
  };

  // Filter logic is now handled by API params (startDate, endDate)
  // But strictly filtering:
  const filteredRecords = attendanceRecords;

  // Hitung statistik berdasarkan data yang difilter - termasuk terlambat
  const calculateStats = () => {
    const stats = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
      pulang: 0
    };

    filteredRecords.forEach(record => {
      const status = record.status.toLowerCase();
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    return stats;
  };

  const stats = calculateStats();

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const handleImageZoom = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const closeImageZoom = () => {
    setZoomedImage(null);
  };

  // Cek apakah status memerlukan bukti
  const requiresProof = (status) => {
    return ['Izin', 'Sakit', 'Pulang'].includes(status);
  };

  return (
    <div className="riwayat-page">
      <NavbarSiswa />
      <main className="riwayat-main">
        {/* Date Range Filter */}
        <div className="date-range-filter">
          <div className="date-inputt-group">
            <label htmlFor="startDate">
              <Calendar size={18} />
              Dari Tanggal
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              className="date-inputt"
            />
          </div>

          <div className="date-separator">—</div>

          <div className="date-inputt-group">
            <label htmlFor="endDate">
              <Calendar size={18} />
              Sampai Tanggal
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              min={startDate}
              onChange={handleEndDateChange}
              className="date-inputt"
            />
          </div>
        </div>

        {/* Statistics Cards - FIXED dengan class name baru */}
        <div className="riwayat-stats-wrapper">
          <div className="riwayat-stats-grid">
            <div className="riwayat-stat-box box-hadir">
              <div className="riwayat-stat-title">Hadir</div>
              <div className="riwayat-stat-number">{stats.hadir}</div>
            </div>
            <div className="riwayat-stat-box box-terlambat">
              <div className="riwayat-stat-title">Terlambat</div>
              <div className="riwayat-stat-number">{stats.terlambat}</div>
            </div>
            <div className="riwayat-stat-box box-izin">
              <div className="riwayat-stat-title">Izin</div>
              <div className="riwayat-stat-number">{stats.izin}</div>
            </div>
            <div className="riwayat-stat-box box-sakit">
              <div className="riwayat-stat-title">Sakit</div>
              <div className="riwayat-stat-number">{stats.sakit}</div>
            </div>
            <div className="riwayat-stat-box box-alpha">
              <div className="riwayat-stat-title">Alpha</div>
              <div className="riwayat-stat-number">{stats.alpha}</div>
            </div>
            <div className="riwayat-stat-box box-pulang">
              <div className="riwayat-stat-title">Pulang</div>
              <div className="riwayat-stat-number">{stats.pulang}</div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        {filteredRecords.length > 0 ? (
          <div className="table-card">
            {/* Table Header */}
            <div className="table-header">
              <div>No</div>
              <div>Tanggal</div>
              <div>Jam Pelajaran</div>
              <div>Mata Pelajaran</div>
              <div>Guru</div>
              <div>Status</div>
              <div>Detail</div>
            </div>

            {/* Table Rows */}
            {filteredRecords.map((record, index) => (
              <div key={index} className="table-row">
                <div className="table-cell">{index + 1}</div>
                <div className="table-cell">{record.date}</div>
                <div className="table-cell">{record.period}</div>
                <div className="table-cell">{record.subject}</div>
                <div className="table-cell">{record.teacher}</div>
                <div className="table-cell">
                  <span className={`status-badge ${record.statusColor}`}>
                    {record.status}
                  </span>
                </div>
                <div className="table-cell">
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetail(record)}
                    title="Lihat Detail"
                  >
                    <Eye size={28} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>Tidak ada data kehadiran</h3>
            <p>untuk periode {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</p>
          </div>
        )}
      </main>

      {/* Modal Detail */}
      {showModal && selectedRecord && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Kehadiran</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Tanggal:</span>
                <span className="detail-value">{selectedRecord.date}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Jam Pelajaran:</span>
                <span className="detail-value">{selectedRecord.period}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Mata Pelajaran:</span>
                <span className="detail-value">{selectedRecord.subject}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Guru:</span>
                <span className="detail-value">{selectedRecord.teacher}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedRecord.statusColor}`}>
                  {selectedRecord.status}
                </span>
              </div>

              {selectedRecord.reason && (
                <>
                  <div className="detail-divider"></div>

                  <div className="detail-row">
                    <span className="detail-label">Alasan:</span>
                    <span className="detail-value">{selectedRecord.reason}</span>
                  </div>
                </>
              )}

              {/* Bukti Foto Section */}
              {requiresProof(selectedRecord.status) && (
                <>
                  <div className="detail-divider"></div>
                  <div className="detail-row">
                    <span className="detail-label">Bukti Foto:</span>
                    <div className="detail-value">
                      {selectedRecord.proofImage ? (
                        <div className="proof-image-container">
                          <div
                            className="proof-image-wrapper"
                            onClick={() => handleImageZoom(selectedRecord.proofImage)}
                          >
                            <img
                              src={selectedRecord.proofImage}
                              alt="Bukti dokumen"
                              className="proof-image"
                            />
                            <p className="proof-image-hint">
                              <ZoomIn size={14} style={{ display: 'inline', marginRight: '4px' }} />
                              Klik untuk memperbesar foto
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="no-proof-text">
                          Bukti foto belum diunggah oleh wali kelas
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!selectedRecord.reason && !requiresProof(selectedRecord.status) && (
                <>
                  <div className="detail-divider"></div>
                  <p className="no-reason-text">
                    {selectedRecord.status === 'Hadir'
                      ? 'Siswa hadir tepat waktu'
                      : selectedRecord.status === 'Terlambat'
                        ? 'Siswa datang terlambat'
                        : 'Tidak ada keterangan tambahan'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="image-zoom-overlay" onClick={closeImageZoom}>
          <div className="image-zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-zoom-close" onClick={closeImageZoom}>
              <X size={24} />
            </button>
            <img
              src={zoomedImage}
              alt="Bukti dokumen (diperbesar)"
              className="zoomed-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Riwayat;