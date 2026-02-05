import "./KehadiranSiswaRekap.css";
import { useState, useEffect } from "react";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import { FaSchool } from "react-icons/fa6";
import { FaArrowLeft, FaCalendar, FaEdit, FaFileExport, FaUser, FaFilePdf, FaFileExcel } from "react-icons/fa";

export default function KehadiranSiswaRekap() {

  const [showExport, setShowExport] = useState(false);

  const mockRekapData = [
    {
      id: 1,
      nisn: "1234567890",
      nama: "M. Abdul Khosim Ahmadiansyah",
      hadir: 18,
      izin: 1,
      sakit: 0,
      alpha: 0,
      pulang: 1,
    },
    {
      id: 2,
      nisn: "1234567891",
      nama: "Budi Santoso",
      hadir: 17,
      izin: 0,
      sakit: 1,
      alpha: 0,
      pulang: 0,
    },
    {
      id: 3,
      nisn: "1234567892",
      nama: "Siti Nurhaliza",
      hadir: 15,
      izin: 2,
      sakit: 1,
      alpha: 0,
      pulang: 0,
    },
    {
      id: 4,
      nisn: "1234567893",
      nama: "Ahmad Rizki",
      hadir: 14,
      izin: 1,
      sakit: 2,
      alpha: 1,
      pulang: 0,
    },
  ];

  const [showEditModal, setShowEditModal] = useState(false);

  // State untuk tanggal periode
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');

  // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fungsi untuk mendapatkan tanggal awal bulan
  const getFirstDayOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const handleSave = () => {
    const newData = [...data];

    newData[selectedIndex] = {
      ...newData[selectedIndex],
      hadir: Number(form.hadir),
      izin: Number(form.izin),
      sakit: Number(form.sakit),
      alpha: Number(form.alpha),
      pulang: Number(form.pulang),
    };

    setData(newData);
    setShowEditModal(false);
  };

  const [form, setForm] = useState({
    hadir: '',
    izin: '',
    sakit: '',
    alpha: '',
    pulang: '',
  });

  const [selectedIndex, setSelectedIndex] = useState(null);
  const kelasId = 2; // nanti bisa dari params
  const [data, setData] = useState([]);

  useEffect(() => {
    // Set default tanggal (awal bulan sampai hari ini)
    setTanggalMulai(getFirstDayOfMonth());
    setTanggalSampai(getTodayDate());

    const saved = sessionStorage.getItem("kehadiran-kelas-2");

    if (saved) {
      setData(JSON.parse(saved));
    } else {
      sessionStorage.setItem(
        "kehadiran-kelas-2",
        JSON.stringify(mockRekapData)
      );
      setData(mockRekapData);
    }
  }, []);

  // Fungsi untuk format tanggal ke bahasa Indonesia
  const formatTanggalIndonesia = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // Handler untuk apply filter periode
  const handleApplyPeriode = () => {
    if (tanggalMulai && tanggalSampai) {
      console.log('Filter periode dari:', tanggalMulai, 'sampai:', tanggalSampai);
      // Di sini bisa ditambahkan logic untuk filter data berdasarkan periode
      // Misalnya fetch data dari API dengan parameter tanggal
    }
  };

  return (
    <div className="kehadiran-siswa-rekap-page">
      <NavbarWaka />
      <div className="kehadiran-siswa-rekap-header-card">

        {/* TOP */}
        <div className="kehadiran-siswa-rekap-header-top">
          <div className="kehadiran-siswa-rekap-header-left">
            <div className="kehadiran-siswa-rekap-icon">
              <FaSchool />
            </div>
            <h2>Rekap Kehadiran Peserta Didik</h2>
          </div>

          {/* RIGHT */}
          <div className="kehadiran-siswa-rekap-header-right">

            {/* FILTER PERIODE */}
            <div className="kehadiran-siswa-rekap-periode-wrapper">
              <span className="kehadiran-siswa-rekap-periode-label">
                Periode:
              </span>

              <div className="kehadiran-siswa-rekap-date-range">
                <div className="kehadiran-siswa-rekap-date-input">
                  <FaCalendar />
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    max={tanggalSampai || getTodayDate()}
                  />
                </div>

                <span className="date-separator">—</span>

                <div className="kehadiran-siswa-rekap-date-input">
                  <FaCalendar />
                  <input
                    type="date"
                    value={tanggalSampai}
                    onChange={(e) => setTanggalSampai(e.target.value)}
                    min={tanggalMulai}
                    max={getTodayDate()}
                  />
                </div>

                <button
                  className="kehadiran-siswa-rekap-apply-periode"
                  onClick={handleApplyPeriode}
                  disabled={!tanggalMulai || !tanggalSampai}
                >
                  Terapkan
                </button>
              </div>
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
        </div>

        {/* INFO BAR */}
        <div className="kehadiran-siswa-rekap-info">
          <span className="info-badge">
            <FaUser /> XI RPL 2
          </span>
          <span className="info-badge">
            <FaCalendar />
            {tanggalMulai && tanggalSampai
              ? `${formatTanggalIndonesia(tanggalMulai)} - ${formatTanggalIndonesia(tanggalSampai)}`
              : 'Pilih Periode'
            }
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="kehadiran-siswa-rekap-table-wrapper">
        <table className="kehadiran-siswa-rekap-table">
          <thead>
            <tr>
              <th>No</th>
              <th>NIS/NISN</th>
              <th>Nama Siswa</th>
              <th>Hadir</th>
              <th>Izin</th>
              <th>Sakit</th>
              <th>Alpha</th>
              <th>Pulang</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((siswa, i) => (
              <tr key={siswa.id}>
                <td>{i + 1}</td>
                <td>{siswa.nisn}</td>
                <td><b>{siswa.nama}</b></td>
                <td className="hadir">{siswa.hadir || 0}</td>
                <td className="izin">{siswa.izin || 0}</td>
                <td className="sakit">{siswa.sakit || 0}</td>
                <td className="alpha">{siswa.alpha || 0}</td>
                <td className="pulang">{siswa.pulang || 0}</td>
                <td>
                  <button
                    className="kehadiran-siswa-rekap-edit"
                    onClick={() => {
                      setSelectedIndex(i);
                      setForm({
                        hadir: siswa.hadir || 0,
                        izin: siswa.izin || 0,
                        sakit: siswa.sakit || 0,
                        alpha: siswa.alpha || 0,
                        pulang: siswa.pulang || 0,
                      });
                      setShowEditModal(true);
                    }}
                  >
                    <FaEdit />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
      <button
        className="kehadiran-siswa-rekap-back"
        onClick={() => window.history.back()}
      >
        <FaArrowLeft /> Kembali
      </button>
      {showEditModal && (
        <div className="kehadiran-siswa-rekap-modal-overlay">
          <div className="kehadiran-siswa-rekap-modal">

            <h3 className="kehadiran-siswa-rekap-modal-title">
              Edit Rekap
            </h3>

            <div className="kehadiran-siswa-rekap-modal-body">
              <label>Hadir</label>
              <input
                type="number"
                value={form.hadir}
                onChange={(e) =>
                  setForm({ ...form, hadir: e.target.value })
                }
              />

              <label>Sakit</label>
              <input
                type="number"
                value={form.sakit}
                onChange={(e) =>
                  setForm({ ...form, sakit: e.target.value })
                }
              />

              <label>Alpha</label>
              <input
                type="number"
                value={form.alpha}
                onChange={(e) =>
                  setForm({ ...form, alpha: e.target.value })
                }
              />

              <label>Izin</label>
              <input
                type="number"
                value={form.izin}
                onChange={(e) =>
                  setForm({ ...form, izin: e.target.value })
                }
              />

              <label>Pulang</label>
              <input
                type="number"
                value={form.pulang}
                onChange={(e) =>
                  setForm({ ...form, pulang: e.target.value })
                }
              />
            </div>

            <div className="kehadiran-siswa-rekap-modal-actions">
              <button
                className="kehadiran-siswa-rekap-modal-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Batal
              </button>

              <button
                type="button"
                className="kehadiran-siswa-rekap-modal-save"
                onClick={handleSave}
              >
                Simpan
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}