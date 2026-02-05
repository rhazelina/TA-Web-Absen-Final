import { useState } from 'react';
import QRCodeDisplay from '../Common/QRCodeDisplay';
import CustomAlert from '../Common/CustomAlert';
import { generateQRCode } from '../../services/api';
import './QRGenerateButton.css';

export default function QRGenerateButton({ schedules = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [alertState, setAlertState] = useState({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    const handleGenerateQR = async (scheduleId) => {
        try {
            setIsGenerating(true);
            const result = await generateQRCode(scheduleId, 30); // 30 minutes validity

            setQrData(result);
            setIsSelectModalOpen(false);
            setIsModalOpen(true);
        } catch (error) {
            setAlertState({
                show: true,
                type: 'error',
                title: '❌ Gagal Generate QR',
                message: error.response?.data?.message || 'Terjadi kesalahan saat membuat QR code'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Filter schedules that are available (within 1 hour before start time)
    const availableSchedules = schedules.filter((s) => {
        const now = new Date();
        const scheduleTime = new Date();
        const [hours, minutes] = (s.start_time || s.start || '00:00').split(':');
        scheduleTime.setHours(parseInt(hours), parseInt(minutes));

        // Show schedules within 1 hour before start time
        const oneHourBefore = new Date(scheduleTime.getTime() - 60 * 60 * 1000);
        return now >= oneHourBefore;
    });

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
                onClick={() => setIsSelectModalOpen(true)}
                className="qr-generate-fab"
                title="Generate QR Code"
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
                    <path d="M12 8v8m-4-4h8" />
                </svg>
            </button>

            {/* Schedule Selection Modal */}
            {isSelectModalOpen && (
                <div className="qr-modal-overlay" onClick={() => setIsSelectModalOpen(false)}>
                    <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="qr-modal-header">
                            <h2>📋 Pilih Jadwal untuk Generate QR</h2>
                            <button
                                className="qr-modal-close"
                                onClick={() => setIsSelectModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="qr-modal-body">
                            {availableSchedules.length === 0 ? (
                                <div className="qr-empty-state">
                                    <p className="qr-empty-icon">📅</p>
                                    <p className="qr-empty-title">Tidak ada jadwal tersedia</p>
                                    <p className="qr-empty-desc">
                                        QR code hanya bisa dibuat 1 jam sebelum jadwal dimulai
                                    </p>
                                </div>
                            ) : (
                                <div className="qr-schedule-list">
                                    {availableSchedules.map((schedule) => (
                                        <button
                                            key={schedule.id}
                                            onClick={() => handleGenerateQR(schedule.id)}
                                            disabled={isGenerating}
                                            className="qr-schedule-item"
                                        >
                                            <div className="qr-schedule-info">
                                                <div className="qr-schedule-subject">
                                                    {schedule.subject_name || schedule.mapel || 'Mata Pelajaran'}
                                                </div>
                                                <div className="qr-schedule-details">
                                                    {schedule.teacher_name || schedule.guru || 'Guru'} • {' '}
                                                    {(schedule.start_time || schedule.start || '00:00').substring(0, 5)} - {' '}
                                                    {(schedule.end_time || schedule.end || '00:00').substring(0, 5)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Display Modal */}
            {isModalOpen && qrData && (
                <div className="qr-modal-overlay" onClick={() => {
                    setIsModalOpen(false);
                    setQrData(null);
                }}>
                    <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="qr-modal-header">
                            <h2>✅ QR Code Berhasil Dibuat</h2>
                            <button
                                className="qr-modal-close"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setQrData(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="qr-modal-body">
                            <QRCodeDisplay
                                value={qrData.token}
                                title="QR Code Absensi"
                                expiresAt={qrData.expires_at}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
