import React, { useState, useRef } from 'react';
import './DataGuru.css';
import TambahGuru from '../../components/Admin/TambahGuru';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import CustomAlert from '../../components/Common/CustomAlert';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DataGuru() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
    if (alertState.action === 'delete_teacher') {
      const id = alertState.data;
      setTeachers(teachers.filter(teacher => teacher.id !== id));
      showAlert('success', 'Berhasil', 'Data guru berhasil dihapus!');
      return; // Keep alert open to show success
    }
    closeAlert();
  };

  // ✅ DATA DUMMY (DITAMBAHKAN SAJA)
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      kodeGuru: 'GR001',
      namaGuru: 'Ahmad Fauzi',
      mataPelajaran: 'Matematika',
      role: 'Guru'
    },
    {
      id: 2,
      kodeGuru: 'GR002',
      namaGuru: 'Siti Rahmawati',
      mataPelajaran: 'Bahasa Indonesia',
      role: 'Guru'
    },
    {
      id: 3,
      kodeGuru: 'GR003',
      namaGuru: 'Budi Santoso',
      mataPelajaran: 'Pemrograman Web',
      role: 'Wali Kelas'
    },
  ]);

  const [editingTeacher, setEditingTeacher] = useState(null);
  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  const handleAddTeacher = (formData) => {
    if (editingTeacher) {
      setTeachers(teachers.map(teacher =>
        teacher.id === editingTeacher.id
          ? {
            ...teacher,
            kodeGuru: formData.kodeGuru,
            namaGuru: formData.namaGuru,
            mataPelajaran: formData.mataPelajaran,
            role: formData.role
          }
          : teacher
      ));
      showAlert('success', 'Berhasil', 'Data guru berhasil diperbarui!');
      setEditingTeacher(null);
    } else {
      const newTeacher = {
        id: Date.now(),
        kodeGuru: formData.kodeGuru,
        namaGuru: formData.namaGuru,
        mataPelajaran: formData.mataPelajaran,
        role: formData.role
      };
      setTeachers([...teachers, newTeacher]);
      showAlert('success', 'Berhasil', 'Data guru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = (id) => {
    showAlert('confirm', 'Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data guru ini?', 'delete_teacher', id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  // EKSPOR DATA KE EXCEL
  const handleExportToExcel = () => {
    if (teachers.length === 0) {
      showAlert('warning', 'Peringatan', 'Tidak ada data untuk diekspor!');
      return;
    }

    const excelData = teachers.map((teacher, index) => ({
      'No': index + 1,
      'Kode Guru': teacher.kodeGuru,
      'Nama Guru': teacher.namaGuru,
      'Mata Pelajaran': teacher.mataPelajaran,
      'Role': teacher.role
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 20 }
    ];

    const fileName = `data-guru-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showAlert('success', 'Berhasil', 'Data berhasil diekspor ke Excel!');
    setShowExportMenu(false);
  };

  // EKSPOR DATA KE PDF
  const handleExportToPDF = () => {
    if (teachers.length === 0) {
      showAlert('warning', 'Peringatan', 'Tidak ada data untuk diekspor!');
      return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Data Guru', 14, 22);

    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    // Tabel
    const tableData = teachers.map((teacher, index) => [
      index + 1,
      teacher.kodeGuru,
      teacher.namaGuru,
      teacher.mataPelajaran,
      teacher.role
    ]);

    autoTable(doc, {
      head: [['No', 'Kode Guru', 'Nama Guru', 'Mata Pelajaran', 'Role']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 45 },
        4: { cellWidth: 30 }
      }
    });

    const fileName = `data-guru-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    showAlert('success', 'Berhasil', 'Data berhasil diekspor ke PDF!');
    setShowExportMenu(false);
  };

  // IMPOR DATA DARI EXCEL
  const handleImportFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          showAlert('warning', 'Peringatan', 'File Excel kosong!');
          return;
        }

        const importedData = jsonData.map((row, index) => {
          const kodeGuru = row['Kode Guru'] || row['kodeGuru'] || row['Kode'] || '';
          const namaGuru = row['Nama Guru'] || row['namaGuru'] || row['Nama'] || '';
          const mataPelajaran = row['Mata Pelajaran'] || row['mataPelajaran'] || row['Mapel'] || '';
          const role = row['Role'] || row['role'] || '';

          if (!kodeGuru || !namaGuru || !mataPelajaran || !role) {
            throw new Error(`Baris ${index + 2}: Data tidak lengkap`);
          }

          return {
            id: Date.now() + Math.random(),
            kodeGuru: String(kodeGuru).trim(),
            namaGuru: String(namaGuru).trim(),
            mataPelajaran: String(mataPelajaran).trim(),
            role: String(role).trim()
          };
        });

        setTeachers(importedData);
        showAlert('success', 'Berhasil', `Berhasil mengimpor ${importedData.length} data guru dari Excel!`);
      } catch (error) {
        showAlert('error', 'Gagal', 'Gagal membaca file Excel! ' + error.message);
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

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

  // Icon Excel SVG
  const ExcelIcon = () => (
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
      style={{ marginRight: '8px' }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="9" y1="15" x2="15" y2="15"></line>
      <line x1="9" y1="12" x2="15" y2="12"></line>
      <line x1="9" y1="18" x2="15" y2="18"></line>
    </svg>
  );

  // Icon PDF SVG
  const PDFIcon = () => (
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
      style={{ marginRight: '8px' }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M9 13h6"></path>
      <path d="M9 17h6"></path>
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
      <h1 className="page-title-guru">Data Guru</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <input type="text" placeholder="Cari Guru..." className="search" />
          <div className="select-group">
            <button
              className="btn-tambah"
              onClick={() => {
                setEditingTeacher(null);
                setIsModalOpen(true);
              }}
            >
              Tambahkan
            </button>

            {/* Tombol Ekspor dengan Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                ref={exportButtonRef}
                className="btn-export"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Ekspor ▼
              </button>

              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '170px',
                  marginTop: '5px'
                }}>
                  <button
                    onClick={handleExportToExcel}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: 'none',
                      background: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <ExcelIcon /> Excel (.xlsx)
                  </button>
                  <button
                    onClick={handleExportToPDF}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: 'none',
                      background: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderTop: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <PDFIcon /> PDF (.pdf)
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleImportFromExcel}
              style={{ display: 'none' }}
            />
            <button
              className="btn-import"
              onClick={() => fileInputRef.current?.click()}
            >
              Impor
            </button>
          </div>
        </div>

        <table className="tabel-siswa">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Guru</th>
              <th>Nama Guru</th>
              <th>Mata Pelajaran</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, index) => (
              <tr key={teacher.id}>
                <td>{index + 1}</td>
                <td>{teacher.kodeGuru}</td>
                <td>{teacher.namaGuru}</td>
                <td>{teacher.mataPelajaran}</td>
                <td>{teacher.role}</td>
                <td className="aksi-cell">
                  <button
                    className="aksi edit"
                    onClick={() => handleEditTeacher(teacher)}
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="aksi hapus"
                    onClick={() => handleDeleteTeacher(teacher.id)}
                    title="Hapus"
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TambahGuru
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddTeacher}
        editData={editingTeacher}
      />
    </div>
  );
}

export default DataGuru;