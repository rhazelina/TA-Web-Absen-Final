import { useState } from 'react';
import QRScanner from '../Common/QRScanner';
import CustomAlert from '../Common/CustomAlert';
import { scanQRCode } from '../../services/api';
import './QRScanButton.css';

export default function QRScanButton({ onSuccess }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [alertState, setAlertState] = useState({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    const handleScan = async (qrData) => {
        try {
            setIsScanning(true);

            const response = await scanQRCode(qrData);

            setAlertState({
                show: true,
                type: 'success',
                title: '✅ Absensi Berhasil!',
                message: `Status: ${response.status || 'Hadir'}`
            });

            setIsModalOpen(false);
            onSuccess?.();
        } catch (error) {
            setAlertState({
                show: true,
                type: 'error',
                title: '❌ Gagal Absen',
                message: error.response?.data?.message || 'QR Code tidak valid atau sudah kadaluarsa'
            });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <>
            <CustomAlert
                isOpen={alertState.show}
                onClose={() => setAlertState(prev => ({ ...prev, show: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />

            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="qr-scan-fab"
                title="Scan QR Code"
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            </button>

            {/* QR Scanner Modal */}
            {isModalOpen && (
                <div className="qr-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="qr-modal-header">
                            <h2>📷 Scan QR Code Absensi</h2>
                            <button
                                className="qr-modal-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="qr-modal-body">
                            {isScanning ? (
                                <div className="qr-scanning-state">
                                    <div className="qr-spinner">⏳</div>
                                    <p>Memproses absensi...</p>
                                </div>
                            ) : (
                                <>
                                    <QRScanner
                                        onScan={handleScan}
                                        onError={(error) => {
                                            setAlertState({
                                                show: true,
                                                type: 'warning',
                                                title: '⚠️ Peringatan',
                                                message: error
                                            });
                                        }}
                                        isActive={isModalOpen}
                                    />
                                    <div className="qr-hint">
                                        💡 Pastikan QR code terlihat jelas di kamera
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
