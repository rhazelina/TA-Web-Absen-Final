import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KehadiranGuruIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaCalendar, FaClock, FaFileExport, FaFilePdf, FaFileExcel, FaEye } from 'react-icons/fa';

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
        'Hadir',
        'Terlambat',
        'Hadir',
        'Hadir',
        'Izin',
        'Hadir',
        'Alpha',
        'Alpha',
        '',
        ''
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
    'Belum Absen': { bg: 'status-belum', icon: 'fa-question-circle' },
    'Tidak Ada Jam Mengajar': { bg: 'status-tidak-mengajar', icon: 'fa-minus-circle' }
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
                onClick={() => {
                  console.log('Export PDF');
                  setShowExport(false);
                }}
                className="export-item pdf"
              >
                <FaFilePdf /> PDF
              </button>

              <button
                onClick={() => {
                  console.log('Export Excel');
                  setShowExport(false);
                }}
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
          <div className="legend-item">
            <span className="legend-dot legend-tidak-mengajar"></span>
            <span className="legend-text">Tidak Ada Jam Mengajar</span>
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

                    {k.jam.map((j, idx) => {
                      const status = j && j !== '' ? j : 'Tidak Ada Jam Mengajar';
                      return (
                        <td key={idx} style={{ textAlign: 'center' }}>
                          <span className={`jam-box jam-${status.toLowerCase().replace(' ', '-')}`}></span>
                        </td>
                      );
                    })}

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