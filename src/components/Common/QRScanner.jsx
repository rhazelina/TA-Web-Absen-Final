import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QRScanner.css';

export default function QRScanner({ onScan, onError, isActive }) {
    const scannerRef = useRef(null);
    const [hasCamera, setHasCamera] = useState(true);

    useEffect(() => {
        if (!isActive) return;

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            false
        );

        const onScanSuccess = (decodedText) => {
            scanner.clear();
            onScan(decodedText);
        };

        const onScanFailure = (error) => {
            // Ignore scan failures (normal when no QR in view)
            if (error.includes('NotFoundException')) return;
            console.warn('QR scan error:', error);
        };

        scanner.render(onScanSuccess, onScanFailure).catch((err) => {
            console.error('Failed to start scanner:', err);
            setHasCamera(false);
            onError?.('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
        });

        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [isActive, onScan, onError]);

    if (!hasCamera) {
        return (
            <div className="qr-scanner-error">
                <div className="error-icon">❌</div>
                <p className="error-title">Kamera Tidak Tersedia</p>
                <p className="error-message">
                    Pastikan browser memiliki izin akses kamera
                </p>
            </div>
        );
    }

    return (
        <div className="qr-scanner-container">
            <div id="qr-reader"></div>
            <div className="qr-scanner-hint">
                📷 Arahkan kamera ke QR Code
            </div>
        </div>
    );
}
