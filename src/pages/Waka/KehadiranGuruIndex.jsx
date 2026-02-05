import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KehadiranGuruIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaCalendar, FaClock, FaFileExport, FaFilePdf, FaFileExcel, FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function KehadiranGuruIndex() {
  const navigate = useNavigate();
  const [kehadirans, setKehadirans] = useState([
    {
      id: 1,
      guru: {
        kode_guru: 'GR001',
        nama: 'Budi Santoso, S.Pd',
        kelas: 'XI RPL 1'
      },
      jam: [
        'Hadir', 'Hadir', 'Hadir', 'Hadir', 'Hadir',
        'Hadir', 'Alpha', 'Alpha', 'Alpha', 'Alpha'
      ]
    },
    {
      id: 2,
      guru: {
        kode_guru: 'GR002',
        nama: 'Siti Aminah, S.Pd',
        kelas: 'XI RPL 2'
      },
      jam: [
        'Hadir', 'Terlambat', 'Izin', 'Izin', 'Hadir',
        'Sakit', 'Sakit', 'Alpha', 'Alpha', 'Alpha'
      ]
    }
  ]);


  const [filterJam, setFilterJam] = useState('');
  const [filterTanggal, setFilterTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, namaGuru: '' });
  const [qrModal, setQrModal] = useState({ show: false, kodeGuru: '', namaGuru: '' });
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const statusConfig = {
    Hadir: { bg: 'status-hadir', icon: 'fa-check-circle' },
    Terlambat: { bg: 'status-terlambat', icon: 'fa-clock' },
    Izin: { bg: 'status-izin', icon: 'fa-info-circle' },
    Sakit: { bg: 'status-sakit', icon: 'fa-heartbeat' },
    Alpha: { bg: 'status-alpha', icon: 'fa-times-circle' },
    Pulang: { bg: 'status-pulang', icon: 'fas fa-sign-out-alt' },
    'Belum Absen': { bg: 'status-belum', icon: 'fa-question-circle' }
  };

  const handleDelete = (id) => {
    setKehadirans(prev => prev.filter(k => k.id !== id));
    setDeleteModal({ show: false, id: null, namaGuru: '' });
  };

  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') {
        setDeleteModal({ show: false, id: null, namaGuru: '' });
        setQrModal({ show: false, kodeGuru: '', namaGuru: '' });
      }
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  const hitungStatus = (jamArray) => {
    const count = {
      Hadir: 0,
      Terlambat: 0,
      Alpha: 0,
      Izin: 0,
      Sakit: 0
    };

    jamArray.forEach(j => {
      if (count[j] !== undefined) count[j]++;
    });

    return Object.keys(count).reduce((a, b) =>
      count[a] > count[b] ? a : b
    );
  };

  const [showExport, setShowExport] = useState(false);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Kehadiran Guru', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal: ${filterTanggal}`, 14, 22);
    doc.text(`Jam Ke: ${filterJam || 'Semua Jam'}`, 14, 28);

    // Prepare table data
    const tableData = kehadirans.map((k, i) => {
      const jamData = k.jam.map(j => {
        // Shorten status for table
        if (j === 'Hadir') return 'H';
        if (j === 'Alpha') return 'A';
        if (j === 'Izin') return 'I';
        if (j === 'Sakit') return 'S';
        if (j === 'Pulang') return 'P';
        return '-';
      });

      return [
        i + 1,
        k.guru.kode_guru,
        k.guru.nama,
        k.guru.kelas,
        ...jamData
      ];
    });

    // AutoTable
    doc.autoTable({
      head: [['No', 'Kode', 'Nama Guru', 'Kelas', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [13, 40, 71],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 10 },  // No
        1: { cellWidth: 20 },  // Kode
        2: { cellWidth: 50 },  // Nama
        3: { cellWidth: 25 },  // Kelas
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`Kehadiran-Guru-${filterTanggal}.pdf`);
    setShowExport(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = kehadirans.map((k, i) => ({
      'No': i + 1,
      'Kode Guru': k.guru.kode_guru,
      'Nama Guru': k.guru.nama,
      'Kelas': k.guru.kelas,
      'Jam 1': k.jam[0] || '-',
      'Jam 2': k.jam[1] || '-',
      'Jam 3': k.jam[2] || '-',
      'Jam 4': k.jam[3] || '-',
      'Jam 5': k.jam[4] || '-',
      'Jam 6': k.jam[5] || '-',
      'Jam 7': k.jam[6] || '-',
      'Jam 8': k.jam[7] || '-',
      'Jam 9': k.jam[8] || '-',
      'Jam 10': k.jam[9] || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 12 },  // Kode Guru
      { wch: 30 },  // Nama Guru
      { wch: 15 },  // Kelas
      { wch: 10 },  // Jam 1-10
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kehadiran Guru');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout]), `Kehadiran-Guru-${filterTanggal}.xlsx`);
    setShowExport(false);
  };

  return (
    <div className="kehadiran-guru-index-container">
      <NavbarWaka />
      <div className="kehadiran-guru-index-header">
        <div>
          <h1>Kehadiran Guru</h1>
          <p>Kelola dan monitor kehadiran mengajar guru</p>
        </div>

        <div className="kehadiran-guru-index-export-wrapper">
          <button
            className="kehadiran-guru-index-export-btn"
            onClick={() => setShowExport(prev => !prev)}
          >
            <FaFileExport />
            Ekspor
          </button>

          {showExport && (
            <div className="kehadiran-guru-index-export-menu">
              <button
                onClick={exportToPDF}
                className="export-item pdf"
              >
                <FaFilePdf /> PDF
              </button>

              <button
                onClick={exportToExcel}
                className="export-item excel"
              >
                <FaFileExcel /> Excel
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Filter & Date */}
      <div className="kehadiran-guru-index-filter-wrapper">
        <div className="kehadiran-guru-index-filter-grid">

          {/* Jam Ke */}
          <div className="kehadiran-guru-index-filter-item">
            <label className="kehadiran-guru-index-filter-label">
              <FaClock className='kehadiran-guru-index-filter-icon' />
              Jam Ke-
            </label>
            <select
              value={filterJam}
              onChange={(e) => setFilterJam(e.target.value)}
              className="kehadiran-guru-index-filter-select"
            >
              <option value="">Semua Jam</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Jam ke-{i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="kehadiran-guru-index-filter-item">
            <label className="kehadiran-guru-index-filter-label">
              <FaCalendar className='kehadiran-guru-index-filter-icon' />
              Tanggal
            </label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="kehadiran-guru-index-filter-input"
            />
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="kehadiran-guru-index-table-container">

        {/* TABLE HEADER */}
        <div className="kehadiran-guru-index-table-header">
          <div className="kehadiran-guru-index-table-header-inner">
            <h3 className="kehadiran-guru-index-table-title">
              Daftar Kehadiran Guru ({kehadirans.length})
            </h3>
          </div>
        </div>

        <div className="kehadiran-guru-legend">
          <div className="legend-item">
            <span className="legend-dot legend-hadir"></span>
            <span className="legend-text">Hadir</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-terlambat"></span>
            <span className="legend-text">Terlambat</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-alpha"></span>
            <span className="legend-text">Alpha</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-izin"></span>
            <span className="legend-text">Izin</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-sakit"></span>
            <span className="legend-text">Sakit</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-pulang"></span>
            <span className="legend-text">Pulang</span>
          </div>
        </div>





        {/* TABLE WRAPPER */}
        <div className="kehadiran-guru-index-table-wrapper">
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>No</th>
                <th rowSpan={2}>Kode Guru</th>
                <th rowSpan={2}>Nama Guru</th>
                <th rowSpan={2}>Kelas</th>

                {/* HEADER JAM */}
                <th
                  colSpan={10}
                  style={{
                    textAlign: 'center',
                    fontWeight: '800'
                  }}
                >
                  Jam Pelajaran Ke-
                </th>

                <th rowSpan={2}>Aksi</th>
              </tr>

              <tr>
                {[...Array(10)].map((_, i) => (
                  <th key={i} style={{ textAlign: 'center' }}>
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>



            <tbody>
              {kehadirans.map((k, i) => {
                const statusAkhir = hitungStatus(k.jam);

                return (
                  <tr key={k.id}>
                    <td>{i + 1}</td>
                    <td>
                      <span className="kehadiran-guru-index-badge">
                        {k.guru.kode_guru}
                      </span>
                    </td>

                    <td>{k.guru.nama}</td>

                    <td>
                      <span className="kehadiran-guru-kelas-badge">
                        {k.guru.kelas}
                      </span>
                    </td>

                    {k.jam.map((j, idx) => (
                      <td key={idx} style={{ textAlign: 'center' }}>
                        <span className={`jam-box jam-${j.toLowerCase()}`}></span>
                      </td>
                    ))}

                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="kehadiran-guru-action-btn"
                        onClick={() =>
                          navigate(`/waka/kehadiran-guru/${k.guru.kode_guru}`)
                        }
                      >
                        <FaEye />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default KehadiranGuruIndex;