import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DataSiswa.css';
import TambahSiswa from '../../components/Admin/TambahSiswa';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';

function DataSiswa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { default: apiClient } = await import('../../services/api');
        const { API_ENDPOINTS } = await import('../../utils/constants');

        // Parallel fetch for students and classes
        const [studentsRes, classesRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.STUDENTS),
          apiClient.get('classes') // Assuming endpoint is 'classes'
        ]);

        const studentData = studentsRes.data.data || studentsRes.data;
        const classData = classesRes.data.data || classesRes.data;

        setClasses(classData);

        const mappedStudents = studentData.map(s => ({
          id: s.id,
          nama: s.user?.name || s.name || '-',
          nisn: s.nisn,
          jurusan: s.class_room?.major || s.class?.major || '-',
          kelas: s.class_room?.name || s.class?.name || (classData.find(c => c.id === s.class_id)?.name) || '-',
          classId: s.class_id,
          originalData: s
        }));

        setStudents(mappedStudents);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // alert("Gagal mengambil data dari server."); 
        // Silent error or fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [editData, setEditData] = useState(null);
  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  // ADD / UPDATE DATA
  const handleAddOrUpdate = async (formData) => {
    try {
      const { default: apiClient } = await import('../../services/api');
      const { API_ENDPOINTS } = await import('../../utils/constants');

      const payload = {
        name: formData.namaSiswa,
        nisn: formData.nisn,
        nis: formData.nisn,
        gender: 'L', // Default to L
        address: '-',
        class_id: formData.classId, // Dynamic Class ID
        username: formData.nisn,
        password: 'password123'
      };

      if (editData) {
        await apiClient.put(`${API_ENDPOINTS.STUDENTS}/${editData.id}`, payload);
        alert("Data siswa berhasil diperbarui!");
      } else {
        await apiClient.post(API_ENDPOINTS.STUDENTS, payload);
        alert("Data siswa berhasil ditambahkan!");
      }

      window.location.reload();

    } catch (error) {
      console.error("Error saving student:", error);
      alert(`Gagal menyimpan: ${error.response?.data?.message || error.message}`);
    }

    setIsModalOpen(false);
  };

  // DELETE DATA
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      try {
        const { default: apiClient } = await import('../../services/api');
        const { API_ENDPOINTS } = await import('../../utils/constants');

        await apiClient.delete(`${API_ENDPOINTS.STUDENTS}/${id}`);
        setStudents(students.filter(student => student.id !== id));
        alert('Data siswa berhasil dihapus!');
      } catch (error) {
        console.error("Delete failed", error);
        alert("Gagal menghapus data");
      }
    }
  };

  // CLICK EDIT
  const handleEditClick = (student) => {
    setEditData({
      ...student,
      classId: student.classId || (classes.find(c => c.name === student.kelas)?.id)
    });
    setIsModalOpen(true);
  };

  // DOWNLOAD FORMAT EXCEL (TEMPLATE KOSONG)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Siswa': '',
        'NISN': '',
        'Jurusan': '',
        'Kelas': '',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Data Siswa');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 }
    ];

    const fileName = `Template_Data_Siswa.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert('Template Excel berhasil diunduh!');
  };

  // EKSPOR KE EXCEL
  const handleExportToExcel = () => {
    if (students.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const exportData = students.map((student, index) => ({
      'No': index + 1,
      'Nama Siswa': student.nama,
      'NISN': student.nisn,
      'Jurusan': student.jurusan,
      'Kelas': student.kelas,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 }
    ];

    const fileName = `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert('Data berhasil diekspor ke Excel!');
    setShowExportMenu(false);
  };

  // EKSPOR KE PDF
  const handleExportToPDF = () => {
    if (students.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Data Siswa', 14, 22);

    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    // Tabel
    const tableData = students.map((student, index) => [
      index + 1,
      student.nama,
      student.nisn,
      student.jurusan,
      student.kelas
    ]);

    autoTable(doc, {
      head: [['No', 'Nama Siswa', 'NISN', 'Konsentrasi Keahlian', 'Kelas']],
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
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 }
      }
    });

    const fileName = `Data_Siswa_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    alert('Data berhasil diekspor ke PDF!');
    setShowExportMenu(false);
  };

  // IMPOR DARI EXCEL
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

        const existingNISNs = new Set(students.map(s => s.nisn));
        const importedStudents = [];
        let duplicateCount = 0;

        jsonData.forEach((row, index) => {
          const nama = row['Nama Siswa'] || row['Nama'] || '';
          const nisn = String(row['NISN'] || '').trim();
          const jurusan = row['Jurusan'] || '';
          const kelas = row['Kelas'] || '';

          if (!nama || !nisn || !jurusan || !kelas) {
            console.warn(`Baris ${index + 2}: Data tidak lengkap, dilewati.`);
            return;
          }

          if (existingNISNs.has(nisn)) {
            duplicateCount++;
            return;
          }

          importedStudents.push({
            id: Date.now() + index + Math.random(),
            nama,
            nisn,
            jurusan,
            kelas,
          });
        });

        if (importedStudents.length === 0) {
          if (duplicateCount > 0) {
            alert(`Tidak ada data baru untuk diimpor. (${duplicateCount} data duplikat ditemukan)`);
          } else {
            alert('File Excel kosong atau tidak memiliki data yang valid!');
          }
          return;
        }

        setStudents(prev => [...prev, ...importedStudents]);

        let message = `Berhasil mengimpor ${importedStudents.length} data siswa baru!`;
        if (duplicateCount > 0) {
          message += ` (${duplicateCount} data duplikat dilewati)`;
        }
        alert(message);
      } catch (error) {
        alert('Gagal membaca file Excel! ' + error.message);
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Move Icons outside to avoid re-creation on render
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

  const DownloadIcon = () => (
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );

  return (
    <div className="data-container">
      <NavbarAdmin />
      <h1 className="page-title-siswa">Data Siswa</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <input type="text" placeholder="Cari Siswa..." className="search1" />

          <div className="select-group">
            <label>Konsentrasi Keahlian :</label>
            <select>
              <option>Konsentrasi Keahlian</option>
              <option>RPL</option>
              {/* Keep hardcoded options for filter for now, or populate dynamic? 
                  Focus is on Adding Student. Filter can be updated later or kept simple. */}
              <option>TKJ</option>
              <option>DKV</option>
              <option>AV</option>
              <option>MT</option>
              <option>BC</option>
              <option>AN</option>
              <option>EI</option>
            </select>

            <label>Kelas :</label>
            <select>
              <option>Kelas...</option>
              <option>X</option>
              <option>XI</option>
              <option>XII</option>
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

            {/* Button Download Format Excel */}
            <button
              className="btn-download-template"
              onClick={handleDownloadTemplate}
              title="Download template Excel kosong"
            >
              <DownloadIcon /> Format Excel
            </button>
          </div>
        </div>

        <table className="tabel-siswa">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>NISN</th>
              <th>Konsentrasi Keahlian</th>
              <th>Kelas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.nama}</td>
                <td>{student.nisn}</td>
                <td>{student.jurusan}</td>
                <td>{student.kelas}</td>
                <td className="aksi-cell">
                  <button
                    className="aksi edit"
                    onClick={() => handleEditClick(student)}
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="aksi hapus"
                    onClick={() => handleDeleteStudent(student.id)}
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

      <TambahSiswa
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleAddOrUpdate}
        editData={editData}
        classes={classes}
      />
    </div>
  );
}

export default DataSiswa;