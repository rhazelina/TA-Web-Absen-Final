import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import InputSuratModal from '../../components/WaliKelas/InputDispensasiModal';
import { getHomeroomDashboard, getClassAttendanceByDate } from '../../services/attendance';
import './Data.css';

const Data = () => {
  const navigate = useNavigate();
  const [editingIndex, setEditingIndex] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [classInfo, setClassInfo] = useState({ id: null, name: 'Loading...' });
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterType, setFilterType] = useState('all'); // 'all', 'mapel'
  const [selectedMapel, setSelectedMapel] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [daftarMapel, setDaftarMapel] = useState([]);

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState({
    open: false, file: null, type: null, studentName: '', fileName: '',
    nisn: '', status: '', keterangan: '', isTerlambat: false
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Class Info
        const dashboardData = await getHomeroomDashboard();
        setClassInfo({
          id: dashboardData.class_id,
          name: dashboardData.class_name || dashboardData.className || 'Kelas Saya'
        });

        if (dashboardData.class_id) {
          // 2. Get Today's Attendance
          const today = new Date().toISOString().split('T')[0];
          const attendanceData = await getClassAttendanceByDate(dashboardData.class_id, today);

          // 3. Map Data
          // Assuming attendanceData is an array of records
          const records = Array.isArray(attendanceData) ? attendanceData : (attendanceData.data || []);

          const mapped = records.map(r => ({
            id: r.id, // attendance id
            studentId: r.student_id,
            nisn: r.student_nisn || r.user?.nisn || '-',
            nama: r.student_name || r.user?.name || 'Siswa',
            status: mapStatus(r.status), // Helper needed
            keterangan: r.reason || '',
            jamMasuk: r.check_in_time || null,
            suratFile: r.attachment_url || null,
            suratFileName: r.attachment_name || null,
            wasTerlambat: r.status === 'late',
            mapel: r.subject_name || r.schedule?.subject?.name || '-',
            tanggal: r.date,
            rawStatus: r.status
          }));

          setStudentList(mapped);

          // Extract Unique Mapels
          const mapels = [...new Set(mapped.map(s => s.mapel).filter(m => m !== '-'))];
          setDaftarMapel(mapels);

          // Stats calculation will use studentList state
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mapStatus = (backendStatus) => {
    const map = {
      'present': 'Hadir',
      'sick': 'Sakit',
      'excused': 'Izin',
      'izin': 'Izin',
      'absent': 'Alpha',
      'late': 'Terlambat',
      'pulang': 'Pulang'
    };
    return map[backendStatus] || backendStatus;
  };

  const getFilteredStudents = () => {
    let filtered = [...studentList];
    if (filterType === 'mapel' && selectedMapel) {
      filtered = filtered.filter(s => s.mapel === selectedMapel);
    }
    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const stats = {
    Hadir: filteredStudents.filter((s) => s.status === 'Hadir').length,
    Izin: filteredStudents.filter((s) => s.status === 'Izin').length,
    Sakit: filteredStudents.filter((s) => s.status === 'Sakit').length,
    Alpha: filteredStudents.filter((s) => s.status === 'Alpha').length,
    Pulang: filteredStudents.filter((s) => s.status === 'Pulang').length,
    Terlambat: filteredStudents.filter((s) => s.status === 'Terlambat' || s.wasTerlambat).length,
  };

  const handleStatusChange = (index, value) => {
    // In a real app, we should call API to update status
    // For now, update local state to reflect UI change (Optimistic UI)
    // Implementation of API update is complex here (requires schedule_id etc)
    // We will just update local state for the demo, or adding a TODO

    const updated = [...studentList];
    // Find correctly in main list
    const sItem = filteredStudents[index];
    const actualIndex = studentList.findIndex(s => s.id === sItem.id); // Use ID

    if (actualIndex !== -1) {
      updated[actualIndex].status = value;
      if (value !== 'Terlambat') {
        updated[actualIndex].jamMasuk = null;
      }
      setStudentList(updated);
    }
    setEditingIndex(null);

    // TODO: Call API updateAttendance
  };

  // ... (Keep existing helpers: handleViewSurat, handleDownloadSurat, closePreview, getSuratTitle, getStatusColor)
  // Re-implementing them briefly for completeness

  const handleViewSurat = (student) => {
    const fileType = student.suratFile.match(/\.(jpg|jpeg|png)$/i) ? 'image' : 'pdf';
    setPreviewModal({
      open: true,
      file: student.suratFile,
      type: fileType,
      studentName: student.nama,
      fileName: student.suratFileName || 'Dokumen',
      nisn: student.nisn,
      status: student.status,
      keterangan: student.keterangan || (student.wasTerlambat ? `Terlambat - Masuk jam ${student.jamMasuk}` : ''),
      isTerlambat: student.wasTerlambat
    });
  };

  const handleDownloadSurat = () => {
    if (previewModal.file) {
      const link = document.createElement('a');
      link.href = previewModal.file;
      link.download = previewModal.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const closePreview = () => {
    setPreviewModal(prev => ({ ...prev, open: false }));
  };

  const getSuratTitle = (status, isTerlambat) => {
    if (isTerlambat) return 'Surat Keterangan Terlambat';
    const map = { Izin: 'Surat Izin', Sakit: 'Surat Sakit', Pulang: 'Surat Pulang' };
    return map[status] || 'Surat Keterangan';
  };

  const getStatusColor = (status) => {
    const colors = { Izin: '#ffc107', Sakit: '#9c27b0', Pulang: '#ff6a1a', Terlambat: '#ff9800' };
    return colors[status] || '#64748b';
  };

  // Handle Upload
  const handleSuratUploaded = (suratData) => {
    // In real app, this should trigger API refresh
    console.log("Surat uploaded (Mock):", suratData);
    // For now we just close modal
    setOpenModal(false);
  };

  const needsSurat = (student) => ['Izin', 'Sakit', 'Pulang'].includes(student.status) || (student.status === 'Hadir' && student.wasTerlambat);
  const needsUploadWarning = (student) => ['Izin', 'Sakit', 'Pulang'].includes(student.status) && !student.suratFile;
  const getKeteranganText = (student) => student.keterangan || '-';


  return (
    <div className="kehadiran-siswa-page">
      <NavbarWakel />
      <div className="page-header">
        <h1>Kehadiran Siswa</h1>
      </div>

      <div className="page-content">
        <div className="header-box">
          <div className="kelas-info">
            <div className="kelas-icon">🏫</div>
            <div>
              <div className="kelas-nama">{classInfo.name}</div>
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <div className="filter-wrapper">
                <button
                  className="btn-primary btn-filter"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  🔍 Filter {filterType !== 'all' && '●'}
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    <div className="filter-option">
                      <label>
                        <input type="radio" value="all" checked={filterType === 'all'} onChange={() => { setFilterType('all'); setSelectedMapel(''); }} />
                        Semua Data
                      </label>
                    </div>
                    <div className="filter-option">
                      <label>
                        <input type="radio" value="mapel" checked={filterType === 'mapel'} onChange={() => setFilterType('mapel')} />
                        Per Mata Pelajaran
                      </label>
                    </div>
                    <div className="filter-select-wrapper">
                      <select
                        value={selectedMapel}
                        onChange={(e) => { setSelectedMapel(e.target.value); setFilterType('mapel'); }}
                        className="filter-select"
                      >
                        <option value="">Pilih Mapel</option>
                        {daftarMapel.map(mapel => (
                          <option key={mapel} value={mapel}>{mapel}</option>
                        ))}
                      </select>
                    </div>
                    <button className="filter-apply-btn" onClick={() => setShowFilterDropdown(false)}>Terapkan</button>
                  </div>
                )}
              </div>

              <button className="btn-primary" onClick={() => navigate('/walikelas/riwayatkehadiran')}>
                Lihat Rekap
              </button>
              <button className="btn-primary" onClick={() => setOpenModal(true)}>
                📄 Unggah Surat
              </button>
            </div>

            {filterType === 'mapel' && selectedMapel && (
              <div className="filter-info">
                <span>📚 {selectedMapel}</span>
              </div>
            )}

            <div className="stat-boxes">
              {Object.keys(stats).map((key) => (
                <div key={key} className="stat-item">
                  <span>{key}</span>
                  <strong>{stats[key]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="table-wrapperr">
          <table>
            <thead>
              <tr>
                <th className="col-no">No</th>
                <th className="col-nisn">NISN</th>
                <th className="col-nama">Nama</th>
                <th className="col-status">Status</th>
                <th className="col-keterangan">Keterangan</th>
                <th className="col-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading data...</td></tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s, i) => (
                  <tr key={i}>
                    <td className="col-no">{i + 1}</td>
                    <td className="col-nisn">{s.nisn}</td>
                    <td className="col-nama">{s.nama}</td>
                    <td className="col-status">
                      {editingIndex === i ? (
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(i, e.target.value)}
                          onBlur={() => setEditingIndex(null)}
                          autoFocus
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Alpha">Alpha</option>
                          <option value="Pulang">Pulang</option>
                        </select>
                      ) : (
                        <div className="status-cell">
                          <span className={`status ${s.status.toLowerCase()}`}>
                            {s.status}
                            {s.wasTerlambat && s.status === 'Hadir' && <span className="terlambat-indicator">⏱</span>}
                          </span>
                          {needsUploadWarning(s) && <span className="surat-belum">Surat belum diunggah</span>}
                        </div>
                      )}
                    </td>
                    <td className="col-keterangan">
                      <span className="keterangan-text">{getKeteranganText(s)}</span>
                    </td>
                    <td className="col-aksi">
                      <div className="aksi-icons">
                        <button title="Edit Status" onClick={() => setEditingIndex(i)} className="btn-icon btn-edit">✎</button>
                        <button
                          title="Lihat Surat"
                          onClick={() => needsSurat(s) && s.suratFile ? handleViewSurat(s) : null}
                          className={`btn-icon btn-view ${needsSurat(s) && s.suratFile ? 'visible' : 'invisible'}`}
                        >
                          👁
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Tidak ada data untuk filter yang dipilih
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InputSuratModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSuratUploaded={handleSuratUploaded}
        studentList={studentList}
      />

      {previewModal.open && (
        <div className="preview-modal-overlay" onClick={closePreview}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div>
                <h3>{getSuratTitle(previewModal.status, previewModal.isTerlambat)}</h3>
                <p className="file-name">{previewModal.fileName}</p>
              </div>
              <button className="close-preview" onClick={closePreview}>✕</button>
            </div>
            {/* Preview content simplified for brevity */}
            <div className="preview-modal-body">
              {previewModal.type === 'image' ? (
                <img src={previewModal.file} alt="Preview" className="image-preview" />
              ) : (
                <div className="pdf-preview">PDF Preview</div>
              )}
            </div>
            <div className="preview-modal-footer">
              <button className="btn-download" onClick={handleDownloadSurat}>Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Data;