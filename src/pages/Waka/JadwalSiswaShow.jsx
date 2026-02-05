import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './JadwalSiswaShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import CustomAlert from '../../components/Common/CustomAlert';
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaArrowLeft,
  FaImage,
  FaTimes,
  FaTrash,
  FaDownload,
  FaSpinner,
  FaChevronRight
} from 'react-icons/fa';

function JadwalSiswaShow() {
  const { id } = useParams();

  const [jadwal, setJadwal] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (alertState.action === 'delete_schedule') {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      const updated = { ...jadwal, gambar_jadwal: null };
      setJadwal(updated);
      localStorage.setItem(`jadwal-siswa-${id}`, JSON.stringify(updated));

      setLoading(false);
      showAlert('success', 'Berhasil', 'Jadwal berhasil dihapus!');
      return;
    }
    closeAlert();
  };


  useEffect(() => {
    const saved = localStorage.getItem(`jadwal-siswa-${id}`);

    if (saved) {
      setJadwal(JSON.parse(saved));
    } else {
      setJadwal({
        id,
        kompetensi_keahlian: 'Belum diisi',
        wali_kelas: '-',
        kelas: '-',
        gambar_jadwal: null
      });
    }
  }, [id]);

  const handleDeleteImage = () => {
    showAlert('confirm', 'Konfirmasi Hapus', 'Yakin ingin menghapus jadwal ini?', 'delete_schedule');
  };

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setShowFullscreen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  if (!jadwal) {
    return (
      <div className="jadwal-siswa-show-loading-screen">
        <FaSpinner /> Loading...
      </div>
    );
  }

  return (
    <>
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
      {/* NAVBAR HARUS DI LUAR */}
      <NavbarWaka />

      <div className="jadwal-siswa-show-root">
        <div className="jadwal-siswa-show-container">

          {/* BREADCRUMB */}
          <div className="jadwal-siswa-show-breadcrumb">
            <Link to="/waka/jadwal-siswa" className="jadwal-siswa-show-breadcrumb-link">
              <FaCalendarAlt />
              <span>Jadwal Siswa</span>
            </Link>
            <FaChevronRight />
            <span>{jadwal.kelas}</span>
          </div>

          {/* HEADER */}
          <div className="jadwal-siswa-show-header">
            <div className="jadwal-siswa-show-header-top">
              <div className="jadwal-siswa-show-header-left">
                <div className="jadwal-siswa-show-icon">
                  <FaUserGraduate />
                </div>
                <div className="jadwal-siswa-show-title">
                  <h1>Jadwal Siswa</h1>
                  <p>{jadwal.kompetensi_keahlian}</p>
                </div>
              </div>

              <Link to="/waka/jadwal-siswa" className="jadwal-siswa-show-btn-back">
                <FaArrowLeft />
                <span>Kembali</span>
              </Link>
            </div>

            <div className="jadwal-siswa-show-header-info">
              <div className="jadwal-siswa-show-info-box">
                <span>Wali Kelas</span>
                <strong>{jadwal.wali_kelas}</strong>
              </div>
              <div className="jadwal-siswa-show-info-box">
                <span>Kelas</span>
                <strong>{jadwal.kelas}</strong>
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="jadwal-siswa-show-card">
            <div className="jadwal-siswa-show-card-header">
              <h2><FaImage /> Jadwal Pembelajaran</h2>
              <p>Jadwal pembelajaran siswa</p>
            </div>

            <div className="jadwal-siswa-show-card-body">
              {jadwal.gambar_jadwal ? (
                <>
                  <div
                    className="jadwal-siswa-show-image-wrapper"
                    onClick={() => setShowFullscreen(true)}
                  >
                    <img src={jadwal.gambar_jadwal} alt="Jadwal" />
                  </div>

                  <div className="jadwal-siswa-show-action">
                    <button
                      onClick={handleDeleteImage}
                      disabled={loading}
                      className="jadwal-siswa-show-btn-delete"
                    >
                      <FaTrash /> Hapus
                    </button>

                    <a
                      href={jadwal.gambar_jadwal}
                      download
                      className="jadwal-siswa-show-btn-download"
                    >
                      <FaDownload /> Download
                    </a>
                  </div>
                </>
              ) : (
                <div className="jadwal-siswa-show-empty">
                  <FaImage />
                  <h3>Belum Ada Jadwal</h3>
                  <p>Jadwal siswa belum tersedia</p>
                </div>
              )}
            </div>
          </div>

          {/* FULLSCREEN */}
          {showFullscreen && (
            <div
              className="jadwal-siswa-show-fullscreen"
              onClick={() => setShowFullscreen(false)}
            >
              <button className="jadwal-siswa-show-fullscreen-close">
                <FaTimes />
              </button>
              <img
                src={jadwal.gambar_jadwal}
                alt="Fullscreen"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default JadwalSiswaShow;
