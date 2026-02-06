import React, { useState, useEffect } from 'react';
import './DataJurusan.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import TambahJurusan from '../../components/Admin/TambahJurusan';
import CustomAlert from '../../components/Common/CustomAlert';

function DataJurusan() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleConfirmAction = async () => {
    if (alertState.action === 'delete_jurusan') {
      const id = alertState.data;
      try {
        const { default: apiClient } = await import('../../services/api');
        await apiClient.delete(`majors/${id}`);
        setJurusans(jurusans.filter(jurusan => jurusan.id !== id));
        showAlert('success', 'Berhasil', 'Data jurusan berhasil dihapus!');
      } catch (error) {
        console.error("Failed to delete:", error);
        showAlert('error', 'Gagal', 'Gagal menghapus jurusan');
      }
      return;
    }
    closeAlert();
  };

  // Data State
  const [jurusans, setJurusans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { default: apiClient } = await import('../../services/api');
      const response = await apiClient.get('majors');
      const data = response.data.data || response.data;

      const mappedData = data.map(m => ({
        id: m.id,
        kodeJurusan: m.code,
        namaJurusan: m.name
      }));
      setJurusans(mappedData);
    } catch (error) {
      console.error("Failed to fetch majors:", error);
      showAlert('error', 'Error', 'Gagal mengambil data jurusan');
    } finally {
      setIsLoading(false);
    }
  };

  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // === TAMBAH BARU ===
  const handleAddJurusan = async (formData) => {
    try {
      const { default: apiClient } = await import('../../services/api');
      await apiClient.post('majors', {
        name: formData.namaJurusan,
        code: formData.kodeJurusan
      });
      showAlert('success', 'Berhasil', 'Data jurusan berhasil ditambahkan!');
      fetchData();
    } catch (error) {
      console.error("Failed to add:", error);
      showAlert('error', 'Gagal', 'Gagal menambahkan jurusan');
    }
    setIsModalOpen(false);
  };

  // === EDIT DATA ===
  // === EDIT DATA ===
  const handleEditJurusan = async (formData) => {
    try {
      const { default: apiClient } = await import('../../services/api');
      await apiClient.put(`majors/${formData.id}`, {
        name: formData.namaJurusan,
        code: formData.kodeJurusan
      });
      showAlert('success', 'Berhasil', 'Data jurusan berhasil diperbarui!');
      fetchData();
      setEditData(null);
    } catch (error) {
      console.error("Failed to update:", error);
      showAlert('error', 'Gagal', 'Gagal memperbarui jurusan');
    }
    setIsModalOpen(false);
  };

  // === HAPUS ===
  const handleDeleteJurusan = (id) => {
    showAlert('confirm', 'Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data jurusan ini?', 'delete_jurusan', id);
  };

  // === FILTER ===
  const filteredJurusans = jurusans.filter(jurusan =>
    jurusan.namaJurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jurusan.kodeJurusan.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <h1 className="page-title">Data Konsentrasi Keahlian</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <input
            type="text"
            placeholder="Cari Jurusan..."
            className="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="select-group">
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
              <th>Kode Konsentrasi Keahlian</th>
              <th>Nama Konsentrasi Keahlian</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredJurusans.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  {searchTerm
                    ? 'Tidak ada data yang sesuai pencarian.'
                    : 'Belum ada data jurusan. Klik "Tambahkan" untuk menambah data.'}
                </td>
              </tr>
            ) : (
              filteredJurusans.map((jurusan, index) => (
                <tr key={jurusan.id}>
                  <td style={{ fontWeight: '700' }}>{index + 1}</td>
                  <td>{jurusan.kodeJurusan}</td>
                  <td>{jurusan.namaJurusan}</td>
                  <td className="aksi-cell">
                    <button
                      className="aksi edit"
                      onClick={() => {
                        setEditData(jurusan);
                        setIsModalOpen(true);
                      }}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="aksi hapus"
                      onClick={() => handleDeleteJurusan(jurusan.id)}
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

      <TambahJurusan
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={editData ? handleEditJurusan : handleAddJurusan}
        editData={editData}
      />
    </div>
  );
}

export default DataJurusan;