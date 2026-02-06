import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PresensiSiswa.css';
import NavbarGuru from '../../components/Guru/NavbarGuru';
import CustomAlert from '../../components/Common/CustomAlert';
import apiClient from '../../services/api';
import { getAttendanceBySchedule, createManualAttendance } from '../../services/attendance';

function PresensiSiswa() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {}; // { mataPelajaran, jamKe, kelas, waktu, tanggal, scheduleId, classId }

  const hasScheduleData = state.scheduleId && state.classId;

  const mataPelajaran = state.mataPelajaran || '';
  const jamKe = state.jamKe || '';
  const kelas = state.kelas || '';
  const waktu = state.waktu || '';
  const tanggal = state.tanggal || '';
  const scheduleId = state.scheduleId;
  const classId = state.classId;

  const [mode, setMode] = useState('input');
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [showDokumenModal, setShowDokumenModal] = useState(false);
  const [currentSiswaIndex, setCurrentSiswaIndex] = useState(null);
  const [keteranganTipe, setKeteranganTipe] = useState('');
  const [keteranganForm, setKeteranganForm] = useState({
    alasan: '',
    jam: '',
    jamKe: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Custom Alert State
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    action: null,
    data: null
  });

  const showAlert = (type, title, message, action = null, data = null) => {
    setAlertState({
      show: true,
      type,
      title,
      message,
      action,
      data
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  const handleConfirmAction = () => {
    closeAlert();
  };

  const daftarJamKe = [
    { value: '1', label: 'Jam Ke-1 (07:00 - 07:45)' },
    { value: '2', label: 'Jam Ke-2 (07:45 - 08:30)' },
    { value: '3', label: 'Jam Ke-3 (08:30 - 09:15)' },
    { value: '4', label: 'Jam Ke-4 (09:15 - 10:00)' },
    { value: '5', label: 'Jam Ke-5 (10:15 - 11:00)' },
    { value: '6', label: 'Jam Ke-6 (11:00 - 11:45)' },
    { value: '7', label: 'Jam Ke-7 (12:30 - 13:15)' },
    { value: '8', label: 'Jam Ke-8 (13:15 - 14:00)' },
  ];

  const [siswaList, setSiswaList] = useState([]);

  // Fetch Data
  useEffect(() => {
    if (!hasScheduleData) return;

    const initData = async () => {
      try {
        setIsLoading(true);
        // 1. Get Students of Class
        // Try filter by class_id if supported by students endpoint
        // Or if we don't have filtered endpoint, we might fail.
        // Assuming /students?class_id=X works
        const studentsRes = await apiClient.get('students', { params: { class_id: classId } });
        const studentsData = studentsRes.data.data || studentsRes.data;

        // 2. Get Existing Attendance
        let existingRecords = [];
        try {
          const attendanceData = await getAttendanceBySchedule(scheduleId);
          existingRecords = Array.isArray(attendanceData) ? attendanceData : [];
        } catch (e) {
          console.log("No existing attendance or error fetching", e);
        }

        // 3. Map
        // Filter students by class if endpoint returns all
        // If classId is passed, backend SHOULD filter. If checks fail on backend, we filter client side.
        // Assuming backend handles filtering.

        const mapped = studentsData
          .filter(s => String(s.class_id) === String(classId) || (!s.class_id)) // Safety filter
          .map((s, index) => {
            const record = existingRecords.find(r => String(r.student_id) === String(s.id));

            // Reconstruct keterangan object if exists
            let ketObj = null;
            if (record && record.reason) {
              // Parse reason if it has structure, or just use as string
              // If we stored JSON string:
              // ketObj = { alasan: record.reason };
              // But logic above for 'terlambat' puts { jam: ... }
              // For now assume simple string or reconstructing basic msg
              ketObj = { alasan: record.reason };
            }

            return {
              id: s.id,
              no: index + 1,
              nisn: s.nisn,
              nama: s.user?.name || s.name || 'Siswa',
              status: record ? record.status : null,
              keterangan: ketObj,
              dokumen: null // We don't have document link easily yet unless in existingRecords
            };
          });

        setSiswaList(mapped);

        // If any record exists, maybe set mode to view?
        if (existingRecords.length > 0) {
          // setMode('view'); // Optional: default to view if already submitted?
        }

      } catch (e) {
        console.error("Failed to load students", e);
        showAlert('error', 'Gagal', 'Gagal memuat data siswa');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [hasScheduleData, scheduleId, classId]);

  const handleStatusChange = (index, newStatus) => {
    if (newStatus === 'late' || newStatus === 'pulang') { // 'late' is backend for 'terlambat'
      setCurrentSiswaIndex(index);
      setKeteranganTipe(newStatus);
      setShowKeteranganModal(true);
      setKeteranganForm({ alasan: '', jam: '', jamKe: '' });
    } else {
      const updated = [...siswaList];
      updated[index].status = newStatus;
      if (newStatus !== 'izin' && newStatus !== 'sick') {
        updated[index].keterangan = null;
      }
      setSiswaList(updated);
    }
  };

  const handleSimpanKeterangan = () => {
    // Validasi
    if (keteranganTipe === 'late') {
      if (!keteranganForm.alasan || !keteranganForm.jam) {
        showAlert('warning', 'Peringatan', 'Mohon lengkapi alasan dan jam masuk!');
        return;
      }
    } else if (keteranganTipe === 'pulang') {
      if (!keteranganForm.alasan || !keteranganForm.jamKe) {
        showAlert('warning', 'Peringatan', 'Mohon lengkapi alasan dan jam ke-!');
        return;
      }
    }

    const updated = [...siswaList];
    updated[currentSiswaIndex].status = keteranganTipe; // 'late' or 'pulang' (pulang will be mapped later)

    let reasonString = keteranganForm.alasan;
    if (keteranganTipe === 'late') {
      reasonString = `Terlambat jam ${keteranganForm.jam}: ${keteranganForm.alasan}`;
      updated[currentSiswaIndex].keterangan = {
        alasan: reasonString,
        jam: keteranganForm.jam
      };
    } else {
      const jamLabel = daftarJamKe.find(j => j.value === keteranganForm.jamKe)?.label || '';
      reasonString = `Pulang jam ke-${keteranganForm.jamKe} (${jamLabel}): ${keteranganForm.alasan}`;
      updated[currentSiswaIndex].keterangan = {
        alasan: reasonString,
        jamKe: keteranganForm.jamKe,
        jamKeLabel: jamLabel
      };
    }

    setSiswaList(updated);
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '' });
  };

  const handleBatalKeterangan = () => {
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '' });
  };

  const handleSimpan = async () => {
    if (!scheduleId) {
      showAlert('error', 'Error', 'Schedule ID tidak ditemukan');
      return;
    }

    const filled = siswaList.filter(s => s.status);
    if (filled.length === 0) {
      showAlert('warning', 'Peringatan', 'Isi status minimal satu siswa');
      return;
    }

    try {
      setIsLoading(true);
      const currentDateStr = new Date().toISOString().split('T')[0];

      // Use sequential or Promise.all
      // Note: If many students, bulk endpoint is better, but creating usage of loop for now

      const promises = filled.map(s => {
        let statusToSend = s.status;
        let reason = s.keterangan ? s.keterangan.alasan : null;

        if (statusToSend === 'pulang') {
          statusToSend = 'izin'; // Map 'pulang' to 'izin'/excused
          // Reason already contains "Pulang..." from handleSimpanKeterangan logic if set via modal
          // If manually set reason via modal, it overrides
        }

        // Map frontend status to backend if needed
        // frontend: present, sick, izin, absent, late
        // backend: present, sick, excused, absent, late, dinas
        // 'izin' -> 'excused' ?? or 'izin'
        // Let's assume 'izin' maps to 'izin' or 'excused' depending on backend enum. 
        // Based on InputManualGuru.tsx in deskta, it uses same strings.

        return createManualAttendance({
          attendee_type: 'student',
          student_id: s.id,
          schedule_id: scheduleId,
          status: statusToSend,
          date: currentDateStr,
          reason: reason
        });
      });

      await Promise.all(promises);

      showAlert('success', 'Berhasil', 'Absensi berhasil disimpan!');
      setMode('view');
    } catch (e) {
      console.error(e);
      showAlert('error', 'Gagal', 'Gagal menyimpan absensi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setMode('input');
  };

  const handleBackToDashboard = () => {
    navigate('/guru/dashboard');
  };

  const handleLihatDokumen = (siswa) => {
    setCurrentSiswaIndex(siswaList.findIndex(s => s.id === siswa.id));
    setShowDokumenModal(true);
  };

  const handleCloseDokumen = () => {
    setShowDokumenModal(false);
    setCurrentSiswaIndex(null);
  };

  const getStatusBadge = (siswa) => {
    const status = siswa.status;
    // const hasDokumen = siswa.dokumen !== null; // Not implemented yet

    if (status === 'present') return <span className="status-badge hadir">Hadir</span>;
    if (status === 'absent') return <span className="status-badge alpha">Alpha</span>;
    if (status === 'late') return <span className="status-badge terlambat">Terlambat</span>;
    if (status === 'pulang') return <span className="status-badge pulang">Pulang</span>;

    if (status === 'sick') return <span className="status-badge sakit">Sakit</span>;
    if (status === 'izin' || status === 'excused') return <span className="status-badge izin">Izin</span>;

    return null;
  };

  if (!hasScheduleData) {
    return (
      <div className="presensi-container">
        <NavbarGuru />
        <div className="no-schedule-wrapper">
          <div className="no-schedule-card">
            <h2>Tidak Ada Jadwal Dipilih</h2>
            <p>Silakan kembali ke dashboard.</p>
            <button className="btn-back-dashboard" onClick={handleBackToDashboard}>Kembali</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="presensi-container">
      <CustomAlert
        isOpen={alertState.show}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirmAction}
        confirmLabel="Ya"
        cancelLabel="Batal"
      />
      <NavbarGuru />

      {isLoading && <div className="loading-overlay">Loading...</div>}

      <div className="kehadiran-header-bar">
        <div className="header-left-section">
          <div className="class-info">
            <h2 className="class-title">{kelas}</h2>
            <p className="class-subtitle">Jam Ke-{jamKe}</p>
          </div>
        </div>

        <div className="kelas-and-action">
          <div className="kelas-pill">{mataPelajaran}</div>
          <div className="tanggal-pill">{tanggal}</div>
          {mode === 'input' && (
            <button className="btn-simpan-presensi" onClick={handleSimpan}>Simpan</button>
          )}
        </div>
      </div>

      {mode === 'input' && (
        <div className="presensi-table-wrapper">
          <table className="presensi-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama Siswa</th>
                <th>Hadir</th>
                <th>Sakit</th>
                <th>Izin</th>
                <th>Alpha</th>
                <th>Terlambat</th>
                <th>Pulang</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.map((siswa, index) => (
                <tr key={index}>
                  <td>{index + 1}.</td>
                  <td>{siswa.nisn}</td>
                  <td>{siswa.nama}</td>
                  <td className="radio-cell"><input type="radio" name={`status-${index}`} checked={siswa.status === 'present'} onChange={() => handleStatusChange(index, 'present')} /></td>
                  <td className="radio-cell"><input type="radio" name={`status-${index}`} checked={siswa.status === 'sick'} onChange={() => handleStatusChange(index, 'sick')} /></td>
                  <td className="radio-cell"><input type="radio" name={`status-${index}`} checked={siswa.status === 'izin' || siswa.status === 'excused'} onChange={() => handleStatusChange(index, 'izin')} /></td>
                  <td className="radio-cell"><input type="radio" name={`status-${index}`} checked={siswa.status === 'absent'} onChange={() => handleStatusChange(index, 'absent')} /></td>
                  <td className="radio-cell"><input type="radio" name={`status-${index}`} checked={siswa.status === 'late'} onChange={() => handleStatusChange(index, 'late')} /></td>
                  <td className="radio-cell"><input type="radio" name={`status-${index}`} checked={siswa.status === 'pulang'} onChange={() => handleStatusChange(index, 'pulang')} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'view' && (
        <div className="kehadiran-view-wrapper">
          <table className="kehadiran-view-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama Siswa</th>
                <th>Status</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.map((siswa, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{siswa.nisn}</td>
                  <td>{siswa.nama}</td>
                  <td>{getStatusBadge(siswa)}</td>
                  <td>{siswa.keterangan ? (siswa.keterangan.alasan || '-') : '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={handleEdit}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL KETERANGAN */}
      {showKeteranganModal && (
        <div className="modal-overlay" onClick={handleBatalKeterangan}>
          <div className="modal-keterangan" onClick={(e) => e.stopPropagation()}>
            <div className="modal-keterangan-header">
              <h2>{keteranganTipe === 'late' ? 'Keterangan Terlambat' : 'Keterangan Pulang'}</h2>
              <button className="close-btn" onClick={handleBatalKeterangan}>×</button>
            </div>
            <div className="keterangan-form">
              <div className="siswa-info-box">
                <strong>{siswaList[currentSiswaIndex]?.nama}</strong>
              </div>

              {/* FORM CONTENT */}
              <div className="form-group">
                <label>Alasan</label>
                <textarea value={keteranganForm.alasan} onChange={(e) => setKeteranganForm({ ...keteranganForm, alasan: e.target.value })} />
              </div>

              {keteranganTipe === 'late' && (
                <div className="form-group">
                  <label>Jam Masuk</label>
                  <input type="time" value={keteranganForm.jam} onChange={(e) => setKeteranganForm({ ...keteranganForm, jam: e.target.value })} />
                </div>
              )}

              {keteranganTipe === 'pulang' && (
                <div className="form-group">
                  <label>Pulang Jam Ke-</label>
                  <select value={keteranganForm.jamKe} onChange={(e) => setKeteranganForm({ ...keteranganForm, jamKe: e.target.value })}>
                    <option value="">Pilih...</option>
                    {daftarJamKe.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                  </select>
                </div>
              )}

              <div className="modal-buttons">
                <button onClick={handleBatalKeterangan}>Batal</button>
                <button onClick={handleSimpanKeterangan}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresensiSiswa;
