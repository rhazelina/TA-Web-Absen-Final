import { useState, useEffect, useRef } from 'react';
import { Calendar, BookOpen, X, QrCode } from 'lucide-react';
import NavbarPengurus from "../../components/PengurusKelas/NavbarPengurus";
import QRCode from 'qrcode';
import './PresensiKelas.css';

const scheduleData = [
  {
    id: 1,
    subject: 'Matematika',
    class: 'XII RPL 2',
    period: 'Jam ke 1 - 2',
    time: '07:00-08:30',
    qrData: 'MTK-XII-RPL2-001'
  },
  {
    id: 2,
    subject: 'MPKK',
    class: 'XII RPL 2',
    period: 'Jam ke 3 - 4',
    time: '08:30-10:00',
    qrData: 'MPKK-XII-RPL2-002'
  },
  {
    id: 3,
    subject: 'Bahasa Indonesia',
    class: 'XII RPL 2',
    period: 'Jam ke 5 - 6',
    time: '10:15-11:45',
    qrData: 'BIND-XII-RPL2-003'
  },
  {
    id: 4,
    subject: 'PAI',
    class: 'XII RPL 2',
    period: 'Jam ke 7 - 8',
    time: '12:30-14:00',
    qrData: 'PAI-XII-RPL2-004'
  },
  {
    id: 5,
    subject: 'PKDK',
    class: 'XII RPL 2',
    period: 'Jam ke 1 - 2',
    time: '07:00-08:30',
    qrData: 'PKDK-XII-RPL2-005'
  },
  {
    id: 6,
    subject: 'MPP',
    class: 'XII RPL 2',
    period: 'Jam ke 3 - 4',
    time: '08:30-10:00',
    qrData: 'MPP-XII-RPL2-006'
  },
  {
    id: 7,
    subject: 'Bahasa Inggris',
    class: 'XII RPL 2',
    period: 'Jam ke 5 - 6',
    time: '10:15-11:45',
    qrData: 'BING-XII-RPL2-007'
  },
  {
    id: 8,
    subject: 'Bahasa Jawa',
    class: 'XII RPL 2',
    period: 'Jam ke 7 - 8',
    time: '12:30-14:00',
    qrData: 'BJAWA-XII-RPL2-008'
  }
];

function PresensiKelas() {
  const [selectedQR, setSelectedQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // Function to format date
    const formatDate = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // Set initial date
    setCurrentDate(formatDate());

    // Update date every minute
    const interval = setInterval(() => {
      setCurrentDate(formatDate());
    }, 60000);

    // Cleanup interval
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showQRModal && selectedQR) {
      generateQR(selectedQR.qrData);
    }
  }, [showQRModal, selectedQR]);

  const generateQR = async (text) => {
    try {
      const url = await QRCode.toDataURL(text, { width: 300, margin: 2 });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQRClick = (schedule) => {
    setSelectedQR(schedule);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedQR(null);
    setQrCodeUrl('');
  };

  return (
    <div className="jadwal-page">
      <NavbarPengurus />

      <div className="jadwal-containerr">
        {/* Left Sidebar */}
        <div className="jadwal-sidebarr">
          <div className="sidebar-icon">
            <BookOpen size={60} strokeWidth={2} />
          </div>
          <div>
            <h2 className="sidebar-title">XII Rekayasa Perangkat Lunak 2</h2>
            <p className="sidebar-subtitle">Triana Ardianie S.Pd</p>
          </div>
          <div className="sidebar-divider"></div>
        </div>

        {/* Right Content */}
        <div className="jadwal-content">
          {/* Date Header */}
          <div className="date-header">
            <Calendar size={20} />
            <span>{currentDate}</span>
          </div>

          {/* Schedule Grid */}
          <div className="schedule-grid">
            {scheduleData.map((schedule) => (
              <div key={schedule.id} className="schedule-card">
                <div className="schedule-info">
                  <div className="schedule-icon-wrapper">
                    <BookOpen size={24} />
                  </div>
                  <div className="schedule-text">
                    <div className="schedule-left">
                      <h3>{schedule.subject}</h3>
                      <p className="schedule-period">{schedule.period}</p>
                    </div>
                    <div className="schedule-right">
                      <p className="schedule-class">{schedule.class}</p>
                      <p className="schedule-time">{schedule.time}</p>
                    </div>
                  </div>
                </div>
                <div className="schedule-actions">
                  <button
                    className="qr-button"
                    onClick={() => handleQRClick(schedule)}
                    title="Scan QR Code"
                  >
                    <QrCode size={32} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedQR && (
        <div className="qr-modal-overlay" onClick={closeQRModal}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>Scan Kode QR</h3>
              <button className="qr-close-btn" onClick={closeQRModal}>
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            <div className="qr-modal-body">
              <div className="qr-info">
                <h4>{selectedQR.subject}</h4>
                <p>{selectedQR.class}</p>
                <p className="qr-period-info">{selectedQR.period} • {selectedQR.time}</p>
              </div>
              <div className="qr-code-container">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="qr-code-image"
                  />
                ) : <p>Generating QR...</p>}
              </div>
              <p className="qr-instruction">
                Scan kode QR di atas untuk melakukan presensi
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresensiKelas;