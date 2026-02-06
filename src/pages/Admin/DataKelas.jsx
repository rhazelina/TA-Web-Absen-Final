import React, { useState, useEffect } from 'react';
import './DataKelas.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import TambahKelas from '../../components/Admin/TambahKelas';
import CustomAlert from '../../components/Common/CustomAlert';
import apiClient from '../../services/api';
import DummyJadwal from '../../assets/images/DummyJadwal.png';

function DataKelas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

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
    if (alertState.action === 'delete_kelas') {
      const id = alertState.data;
      setKelas(kelas.filter(k => k.id !== id));
      showAlert('success', 'Berhasil', 'Data kelas berhasil dihapus!');
      return;
    }
    closeAlert();
  };

  // Data State
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const [majors, setMajors] = useState([]);
  const [searchKelas, setSearchKelas] = useState('');
  const [searchJurusan, setSearchJurusan] = useState('');
  const [viewJadwalClass, setViewJadwalClass] = useState(null);

  const handleUploadJadwal = async (classId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('schedule_image', file);
    formData.append('_method', 'PUT'); // If backend requires Method Spoofing for PUT with files

    try {
      await apiClient.post(`/classes/${classId}/schedule-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showAlert('success', 'Berhasil', 'Jadwal berhasil diupload');
      fetchData(); // Refresh data to see new image
    } catch (error) {
      console.error(error);
      showAlert('error', 'Gagal', 'Gagal mengupload jadwal');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, majorRes] = await Promise.all([
        apiClient.get('classes'),
        apiClient.get('majors')
      ]);

      const classes = classRes.data.data || classRes.data;
      const majorsData = majorRes.data.data || majorRes.data;

      setMajors(majorsData);

      const formattedClasses = classes.map(cls => ({
        id: cls.id,
        namaKelas: cls.label, // UI uses Nama Kelas as Label
        jurusan: cls.major?.name || cls.major_code || '-',
        kelas: cls.grade,
        waliKelas: cls.homeroom_teacher?.user?.name || cls.homeroom_teacher_name || '-',
        jadwalImage: cls.schedule_image_path,
        originalData: cls
      }));

      setKelas(formattedClasses);
    } catch (error) {
      console.error('Failed to fetch classes/majors:', error);
      showAlert('error', 'Error', 'Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  // ... (Upload Jadwal omitted, it's fine)

  // === TAMBAH BARU ===
  const handleAddKelas = async (formData) => {
    try {
      setLoading(true);
      // Map Jurusan Name to ID
      // formData.jurusan likely comes as Name from TambahKelas component (or ID?)
      // In TambahKelas.jsx, options value is typically NAME unless we change it.
      // Let's assume Name for now as per current UI.

      const selectedMajor = majors.find(m => m.name === formData.jurusan || m.code === formData.jurusan);
      const majorId = selectedMajor ? selectedMajor.id : null;

      const payload = {
        grade: formData.kelas,
        label: formData.namaKelas,
        major_id: majorId
      };

      await apiClient.post('classes', payload);

      showAlert('success', 'Berhasil', 'Data kelas berhasil ditambahkan!');
      fetchData(); // Reload
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Gagal', 'Gagal menambahkan kelas');
    } finally {
      setLoading(false);
    }
  };

  // === EDIT DATA ===
  const handleEditKelas = async (formData) => {
    try {
      setLoading(true);
      const selectedMajor = majors.find(m => m.name === formData.jurusan || m.code === formData.jurusan);
      const majorId = selectedMajor ? selectedMajor.id : null;

      const payload = {
        grade: formData.kelas,
        label: formData.namaKelas,
        major_id: majorId
      };

      await apiClient.put(`classes/${formData.id}`, payload);

      showAlert('success', 'Berhasil', 'Data kelas berhasil diperbarui!');
      fetchData();
      setIsModalOpen(false);
      setEditData(null);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Gagal', 'Gagal memperbarui kelas');
    } finally {
      setLoading(false);
    }
  };

  // === HAPUS ===
  const handleDeleteKelas = (id) => {
    showAlert('confirm', 'Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data kelas ini?', 'delete_kelas', id);
  };

  // === FILTER ===
  const filteredKelas = kelas.filter(k => {
    const matchKelas = searchKelas === '' || k.kelas === searchKelas;
    const matchJurusan = searchJurusan === '' || k.jurusan === searchJurusan;
    return matchKelas && matchJurusan;
  });

  // Icon Edit SVG
  const EditIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  // Icon Delete SVG
  const DeleteIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <div className="data-container">
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
      <NavbarAdmin />
      <h1 className="page-title-kelas">Data Kelas</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <div className="select-group">
            <label>Pilih Kelas :</label>
            <select value={searchKelas} onChange={(e) => setSearchKelas(e.target.value)}>
              <option value="">Kelas...</option>
              <option value="X">X</option>
              <option value="XI">XI</option>
              <option value="XII">XII</option>
            </select>

            {/*  VALUE YANG BELOM DI SELESAIKAN */}
            <label>Pilih Konsentrasi Keahlian :</label>
            <select value={searchJurusan} onChange={(e) => setSearchJurusan(e.target.value)}>
              <option value="">Konsentrasi Keahlian</option>
              <option value="RPL">RPL</option>
              <option value="TKJ">TKJ</option>
              <option value="DKV">DKV</option>
              <option value="AV">AV</option>
              <option value="MT">MT</option>
              <option value="BC">BC</option>
              <option value="AN">AN</option>
              <option value="EI">EI</option>
            </select>

            <button
              className="btn-tambah"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
            >
              Tambahkan
            </button>
          </div>
        </div>

        <table className="tabel-siswa">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kelas</th>
              <th>Konsentrasi Keahlian</th>
              <th>Wali Kelas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredKelas.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  Tidak ada data yang sesuai filter.
                </td>
              </tr>
            ) : (
              filteredKelas.map((k, index) => (
                <tr key={k.id}>
                  <td style={{ fontWeight: '700' }}>{index + 1}</td>
                  <td>{k.namaKelas}</td>
                  <td>{k.jurusan}</td>
                  <td>{k.waliKelas}</td>
                  <td className="aksi-cell">
                    <button
                      className="aksi view-jadwal"
                      onClick={() => setViewJadwalClass(k)}
                      title="Lihat Jadwal"
                      style={{ marginRight: '5px', backgroundColor: '#10b981', color: 'white' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </button>
                    <button
                      className="aksi edit"
                      onClick={() => {
                        setEditData(k);
                        setIsModalOpen(true);
                      }}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="aksi hapus"
                      onClick={() => handleDeleteKelas(k.id)}
                      title="Hapus"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TambahKelas
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={editData ? handleEditKelas : handleAddKelas}
        editData={editData}
      />

      {/* Jadwal Modal */}
      {viewJadwalClass && (
        <div className="modal-overlay" onClick={() => setViewJadwalClass(null)}>
          <div className="modal-content jadwal-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Jadwal Kelas {viewJadwalClass.namaKelas}</h3>
              <button className="close-btn" onClick={() => setViewJadwalClass(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="jadwal-preview">
                <img
                  src={viewJadwalClass.jadwalImage
                    ? `http://127.0.0.1:8001/storage/${viewJadwalClass.jadwalImage}`
                    : DummyJadwal}
                  alt="Jadwal Kelas"
                  onError={(e) => { e.target.src = DummyJadwal; }}
                />
              </div>
              <div className="upload-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadJadwal(viewJadwalClass.id, e.target.files[0])}
                  style={{ display: 'none' }}
                  id="jadwal-upload"
                />
                <label htmlFor="jadwal-upload" className="btn-upload">
                  Upload Jadwal Baru
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataKelas;