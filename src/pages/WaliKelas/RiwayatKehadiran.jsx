import React, { useState } from 'react';
import './RiwayatKehadiran.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import CustomAlert from '../../components/Common/CustomAlert';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RiwayatKehadiran = () => {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-13');
  const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const className = 'XI RPL 1';

  const [attendanceData, setAttendanceData] = useState([
    {
      no: 1, nisn: '00601', nama: 'Kim Andini', hadir: 10, terlambat: 0, sakit: 2, izin: 1, alpha: 2, pulang: 2,
      details: [
        { tanggal: '25-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Alpha', keterangan: '' },
        { tanggal: '24-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Alpha', keterangan: '' },
        { tanggal: '23-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Bahasa Inggris', guru: 'Siti Nurhaliza S.pd', status: 'Pulang', keterangan: 'Ada keperluan keluarga mendadak' },
        { tanggal: '22-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Fisika', guru: 'Dr. Ahmad Hidayat', status: 'Pulang', keterangan: 'Merasa tidak enak badan' },
        { tanggal: '21-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Kimia', guru: 'Dewi Lestari S.pd', status: 'Sakit', keterangan: 'Demam dan flu, membawa surat dokter' },
        { tanggal: '20-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Biologi', guru: 'Prof. Samsul Arifin', status: 'Sakit', keterangan: 'Masih dalam masa pemulihan dari sakit' },
        { tanggal: '19-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Bahasa Indonesia', guru: 'Budi Santoso S.pd', status: 'Izin', keterangan: 'Mengikuti acara keluarga penting' }
      ]
    },
    {
      no: 2, nisn: '00602', nama: 'Siti Aisyah', hadir: 10, terlambat: 1, sakit: 2, izin: 1, alpha: 1, pulang: 0,
      details: [
        { tanggal: '26-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Bahasa Indonesia', guru: 'Budi Santoso S.pd', status: 'Sakit', keterangan: 'Demam tinggi, istirahat di rumah' },
        { tanggal: '25-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Kimia', guru: 'Dewi Lestari S.pd', status: 'Sakit', keterangan: 'Masih dalam masa pemulihan sakit' },
        { tanggal: '24-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Izin', keterangan: 'Menghadiri acara keluarga di luar kota' },
        { tanggal: '23-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Sejarah', guru: 'Rina Kusuma S.pd', status: 'Alpha', keterangan: '' }
      ]
    },
    {
      no: 3, nisn: '00603', nama: 'Budi Santoso', hadir: 11, terlambat: 2, sakit: 1, izin: 2, alpha: 0, pulang: 1,
      details: [
        { tanggal: '27-05-2025', jamPelajaran: '1-4', mataPelajaran: 'PKN', guru: 'Hendra Wijaya S.pd', status: 'Sakit', keterangan: 'Flu dan batuk, membawa surat dokter' },
        { tanggal: '26-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Seni Budaya', guru: 'Nina Karlina S.pd', status: 'Izin', keterangan: 'Keperluan administrasi penting' },
        { tanggal: '25-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Olahraga', guru: 'Tono Sukirman S.pd', status: 'Izin', keterangan: 'Mengikuti lomba tingkat kabupaten' },
        { tanggal: '24-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Bahasa Jawa', guru: 'Sri Mulyani S.pd', status: 'Pulang', keterangan: 'Pusing dan mual setelah olahraga' }
      ]
    }
  ]);

  const formatDateDisplay = (start, end) => {
    const opt = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${new Date(start).toLocaleDateString('id-ID', opt)} - ${new Date(end).toLocaleDateString('id-ID', opt)}`;
  };

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    if (endDate < val) setEndDate(val);
  };

  const handleEditChange = (field, value) => {
    const numValue = Number(value);
    if (numValue < 0) return;
    setEditRow({ ...editRow, [field]: numValue });
  };

  const openEditModal = (row) => {
    setEditRow({ ...row });
    setShowModal(true);
  };

  const openDetailModal = (row) => {
    setSelectedStudent(row);
    setShowDetailModal(true);
  };

  const saveEdit = () => {
    setAttendanceData(attendanceData.map(d => d.no === editRow.no ? editRow : d));
    setEditRow(null);
    setShowModal(false);
  };

  const cancelEdit = () => {
    setEditRow(null);
    setShowModal(false);
  };

  const closeDetailModal = () => {
    setSelectedStudent(null);
    setShowDetailModal(false);
  };

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Riwayat Kehadiran');

    ws.mergeCells('A1:I1'); // Diperluas ke kolom I
    const titleCell = ws.getCell('A1');
    titleCell.value = `RIWAYAT KEHADIRAN SISWA`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0a1f3e' }
    };
    ws.getRow(1).height = 30;

    ws.mergeCells('A2:I2'); // Diperluas ke kolom I
    const classCell = ws.getCell('A2');
    classCell.value = `Kelas: ${className}`;
    classCell.font = { bold: true, size: 12 };
    classCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 25;

    ws.mergeCells('A3:I3'); // Diperluas ke kolom I
    const periodCell = ws.getCell('A3');
    periodCell.value = `Periode: ${formatDateDisplay(startDate, endDate)}`;
    periodCell.font = { size: 11 };
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 20;

    ws.addRow([]);

    const headerRow = ws.addRow(['No', 'NISN', 'Nama', 'Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpha', 'Pulang']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0066cc' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    attendanceData.forEach((r, index) => {
      const dataRow = ws.addRow([r.no, r.nisn, r.nama, r.hadir, r.terlambat, r.sakit, r.izin, r.alpha, r.pulang]);
      dataRow.height = 20;

      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = {
          horizontal: colNumber === 3 ? 'left' : 'center',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };

        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' }
          };
        }
      });
    });

    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 12;
    ws.getColumn(3).width = 25;
    ws.getColumn(4).width = 10;
    ws.getColumn(5).width = 10;
    ws.getColumn(6).width = 10;
    ws.getColumn(7).width = 10;
    ws.getColumn(8).width = 10;
    ws.getColumn(9).width = 10;

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `Riwayat_Kehadiran_${className}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportOpen(false);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');

      doc.setFillColor(10, 31, 62);
      doc.rect(0, 0, 297, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('RIWAYAT KEHADIRAN SISWA', 148.5, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Kelas: ${className}`, 148.5, 23, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Periode: ${formatDateDisplay(startDate, endDate)}`, 148.5, 30, { align: 'center' });

      const tableData = attendanceData.map(r => [
        r.no,
        r.nisn,
        r.nama,
        r.hadir,
        r.terlambat,
        r.sakit,
        r.izin,
        r.alpha,
        r.pulang
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['No', 'NISN', 'Nama', 'Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpha', 'Pulang']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 65, halign: 'left' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 18, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 18, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { top: 40, left: 14, right: 14 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          148.5,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          `Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          148.5,
          doc.internal.pageSize.height - 5,
          { align: 'center' }
        );
      }

      doc.save(`Riwayat_Kehadiran_${className}_${new Date().toISOString().split('T')[0]}.pdf`);
      setIsExportOpen(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showAlert('error', 'Gagal', 'Gagal mengekspor PDF. Silakan coba lagi.');
    }
  };

  return (
    <div className="kehadiran-siswa-pagee">
      <CustomAlert
        isOpen={alertState.show}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmLabel="Ya"
        cancelLabel="Batal"
      />
      <NavbarWakel />
      <div className="page-title-header">
        <h1>Riwayat Kehadiran</h1>
      </div>

      <div className="kehadiran-content">
        <div className="top-control-bar">
          <div className="control-left-group">
            <div className="selected-period-display">
              📅 {formatDateDisplay(startDate, endDate)}
            </div>

            <div className="periode-selector">
              <div className="periode-box" onClick={() => setIsPeriodeOpen(!isPeriodeOpen)}>
                Pilih Periode ▼
              </div>

              {isPeriodeOpen && (
                <div className="periode-dropdown-daterange">
                  <div className="date-range-inputs">
                    <div>
                      <label>Dari</label>
                      <input type="date" value={startDate} onChange={handleStartDateChange} />
                    </div>
                    <div>
                      <label>Sampai</label>
                      <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>
                  <button className="apply-date-btn" onClick={() => setIsPeriodeOpen(false)}>Terapkan</button>
                </div>
              )}
            </div>

            <div className="class-display-box">
              <b>{className}</b>
            </div>
          </div>

          <div className="export-selector">
            <button className="action-button" onClick={() => setIsExportOpen(!isExportOpen)}>
              Ekspor ▼
            </button>

            {isExportOpen && (
              <div className="export-dropdown">
                <button className="export-option" onClick={handleExportExcel}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Ekspor Excel
                </button>
                <button className="export-option" onClick={handleExportPDF}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Ekspor PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="student-data-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama</th>
                <th>Hadir</th>
                <th>Terlambat</th>
                <th>Sakit</th>
                <th>Izin</th>
                <th>Alpha</th>
                <th>Pulang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map(row => (
                <tr key={row.no}>
                  <td>{row.no}</td>
                  <td>{row.nisn}</td>
                  <td>{row.nama}</td>
                  <td>{row.hadir}</td>
                  <td>{row.terlambat}</td>
                  <td>{row.sakit}</td>
                  <td>{row.izin}</td>
                  <td>{row.alpha}</td>
                  <td>{row.pulang}</td>
                  <td>
                    <button className="view-btn" onClick={() => openDetailModal(row)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button className="edit-btn" onClick={() => openEditModal(row)}>Ubah</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ubah Rekap</h2>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Hadir</label>
                <input
                  type="number"
                  min="0"
                  value={editRow?.hadir || 0}
                  onChange={e => handleEditChange('hadir', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Terlambat</label>
                <input
                  type="number"
                  min="0"
                  value={editRow?.terlambat || 0}
                  onChange={e => handleEditChange('terlambat', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Sakit</label>
                <input
                  type="number"
                  min="0"
                  value={editRow?.sakit || 0}
                  onChange={e => handleEditChange('sakit', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Alpha</label>
                <input
                  type="number"
                  min="0"
                  value={editRow?.alpha || 0}
                  onChange={e => handleEditChange('alpha', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Izin</label>
                <input
                  type="number"
                  min="0"
                  value={editRow?.izin || 0}
                  onChange={e => handleEditChange('izin', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Pulang</label>
                <input
                  type="number"
                  min="0"
                  value={editRow?.pulang || 0}
                  onChange={e => handleEditChange('pulang', e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={cancelEdit}>Batal</button>
                <button className="save-btn" onClick={saveEdit}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedStudent && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Kehadiran - {selectedStudent.nama}</h2>
            </div>

            <div className="modal-body">
              <div className="detail-table-wrapper">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Jam Pelajaran</th>
                      <th>Mata Pelajaran</th>
                      <th>Guru</th>
                      <th>Keterangan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.details && selectedStudent.details.map((detail, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}.</td>
                        <td>{detail.tanggal}</td>
                        <td>{detail.jamPelajaran}</td>
                        <td>{detail.mataPelajaran}</td>
                        <td>{detail.guru}</td>
                        <td>{detail.keterangan || '-'}</td>
                        <td>
                          <span className={`status-badge status-${detail.status.toLowerCase()}`}>
                            {detail.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatKehadiran;