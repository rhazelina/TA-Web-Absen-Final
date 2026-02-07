import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import './Presensi.css';
import CustomAlert from '../../components/Common/CustomAlert';
import apiClient from '../../services/api';
import { getAttendanceBySchedule, createManualAttendance } from '../../services/attendance';

const Presensi = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // Destructure state with defaults
  const {
    mataPelajaran = '',
    jamKe = '',
    kelas = '',
    waktu = '',
    tanggal = '',
    scheduleId,
    classId
  } = state;

  const [siswaList, setSiswaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type, title, message) => {
    setAlertState({ show: true, type, title, message });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  // Modal Keterangan
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [currentSiswaIndex, setCurrentSiswaIndex] = useState(null);
  const [keteranganForm, setKeteranganForm] = useState({ alasan: '' });

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!scheduleId || !classId) {
        console.error("Missing scheduleId or classId");
        return;
      }

      try {
        setIsLoading(true);

        // 1. Fetch Students
        const studentsRes = await apiClient.get('students', { params: { class_id: classId } });
        const studentsData = studentsRes.data.data || studentsRes.data; // Handle potential wrapper

        // 2. Fetch Existing Attendance
        let existingRecords = [];
        try {
          const attendanceRes = await getAttendanceBySchedule(scheduleId);
          existingRecords = Array.isArray(attendanceRes) ? attendanceRes : [];
        } catch (e) {
          console.warn("No existing attendance or error fetching", e);
        }

        // 3. Map Data
        const mapped = studentsData.map((s, index) => {
          const record = existingRecords.find(r => String(r.student_id) === String(s.id));

          let status = null;
          if (record) {
            if (record.status === 'present') status = 'Hadir';
            else if (record.status === 'sick') status = 'Sakit';
            else if (record.status === 'excused' || record.status === 'izin') status = 'Izin';
            else if (record.status === 'absent') status = 'Alpha';
            else if (record.status === 'late') status = 'Terlambat';
            else if (record.status === 'pulang') status = 'Pulang';
            else status = record.status; // Fallback
          }

          return {
            id: s.id,
            no: index + 1,
            nisn: s.nisn,
            nama: s.user?.name || s.name || 'Siswa',
            status: status,
            keterangan: record?.reason || '',
          };
        });

        setSiswaList(mapped);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        showAlert('error', 'Gagal', 'Gagal memuat data siswa');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [scheduleId, classId]);


  const handleStatusChange = (index, value) => {
    const updated = [...siswaList];
    updated[index].status = value;

    // Reset keterangan if not relevant
    if (!['Izin', 'Sakit', 'Pulang', 'Terlambat'].includes(value)) {
      updated[index].keterangan = '';
    }

    setSiswaList(updated);
  };

  const handleOpenKeterangan = (index) => {
    setCurrentSiswaIndex(index);
    setKeteranganForm({ alasan: siswaList[index].keterangan || '' });
    setShowKeteranganModal(true);
  };

  const handleSaveKeterangan = () => {
    const updated = [...siswaList];
    updated[currentSiswaIndex].keterangan = keteranganForm.alasan;
    setSiswaList(updated);
    setShowKeteranganModal(false);
  };

  const handleSimpan = async () => {
    if (!scheduleId) {
      showAlert('error', 'Error', 'Jadwal tidak ditemukan');
      return;
    }

    const filled = siswaList.filter(s => s.status);
    if (filled.length === 0) {
      showAlert('warning', 'Peringatan', 'Mohon isi presensi siswa');
      return;
    }

    setIsLoading(true);
    try {
      const currentDateStr = new Date().toISOString().split('T')[0];

      const promises = filled.map(s => {
        let backendStatus = 'present';
        if (s.status === 'Hadir') backendStatus = 'present';
        else if (s.status === 'Sakit') backendStatus = 'sick';
        else if (s.status === 'Izin') backendStatus = 'excused';
        else if (s.status === 'Alpha') backendStatus = 'absent';
        else if (s.status === 'Terlambat') backendStatus = 'late';
        else if (s.status === 'Pulang') backendStatus = 'pulang';

        return createManualAttendance({
          attendee_type: 'student',
          student_id: s.id,
          schedule_id: scheduleId,
          status: backendStatus,
          date: currentDateStr,
          reason: s.keterangan || null
        });
      });

      await Promise.all(promises);

      showAlert('success', 'Berhasil', 'Presensi berhasil disimpan');
      setTimeout(() => navigate('/walikelas/dashboard'), 1500);

    } catch (error) {
      console.error('Save error:', error);
      showAlert('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!scheduleId) {
    return (
      <div className="presensi-page">
        <NavbarWakel />
        <div className="presensi-container" style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Akses Ditolak</h2>
          <p>Silakan akses halaman ini melalui Dashboard.</p>
          <button className="btn-kembali" onClick={() => navigate('/walikelas/dashboard')}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="presensi-page">
      <NavbarWakel />

      {isLoading && <div className="loading-overlay">Loading...</div>}

      <div className="presensi-container">
        {/* Header Section */}
        <div className="presensi-header">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/walikelas/dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="header-info">
              <h1>{mataPelajaran}</h1>
              <p>{kelas} | {waktu} (Jam ke-{jamKe})</p>
            </div>
          </div>
          <div className="header-right">
            <div className="date-badge">
              📅 {tanggal}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="presensi-content">
          <div className="table-wrapper">
            <table className="presensi-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No</th>
                  <th>NISN</th>
                  <th>Nama Siswa</th>
                  <th>Status Kehadiran</th>
                  <th>Keterangan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.length > 0 ? (
                  siswaList.map((siswa, index) => (
                    <tr key={siswa.id} className={siswa.status ? `row-${siswa.status.toLowerCase()}` : ''}>
                      <td className="text-center">{siswa.no}</td>
                      <td>{siswa.nisn}</td>
                      <td className="font-medium">{siswa.nama}</td>
                      <td>
                        <div className="status-options">
                          {['Hadir', 'Sakit', 'Izin', 'Alpha', 'Terlambat', 'Pulang'].map(opt => (
                            <label key={opt} className={`status-radio ${opt.toLowerCase()} ${siswa.status === opt ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name={`status-${siswa.id}`}
                                value={opt}
                                checked={siswa.status === opt}
                                onChange={() => handleStatusChange(index, opt)}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="keterangan-text">
                          {siswa.keterangan || '-'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-notes"
                          onClick={() => handleOpenKeterangan(index)}
                          title="Tambahkan Keterangan"
                        >
                          📝
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      {isLoading ? 'Memuat data...' : 'Tidak ada data siswa'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="presensi-footer">
          <div className="summary-stats">
            <span>Hadir: {siswaList.filter(s => s.status === 'Hadir').length}</span>
            <span>Sakit: {siswaList.filter(s => s.status === 'Sakit').length}</span>
            <span>Izin: {siswaList.filter(s => s.status === 'Izin').length}</span>
            <span>Alpha: {siswaList.filter(s => s.status === 'Alpha').length}</span>
          </div>
          <button className="btn-simpan" onClick={handleSimpan}>
            Simpan Presensi
          </button>
        </div>
      </div>

      {/* Modal Keterangan */}
      {showKeteranganModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Keterangan Tambahan</h3>
            <p>{siswaList[currentSiswaIndex]?.nama}</p>
            <textarea
              value={keteranganForm.alasan}
              onChange={(e) => setKeteranganForm({ ...keteranganForm, alasan: e.target.value })}
              placeholder="Masukkan alasan atau keterangan tambahan..."
              rows="4"
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowKeteranganModal(false)}>Batal</button>
              <button className="btn-save" onClick={handleSaveKeterangan}>Simpan</button>
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
      />
    </div>
  );
};

export default Presensi;