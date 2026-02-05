import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import './QRCodeDisplay.css';

export default function QRCodeDisplay({ value, title = 'QR Code Absensi', expiresAt }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) console.error('QR generation error:', error);
            });
        }
    }, [value]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="qr-display-container">
            <h3 className="qr-display-title">{title}</h3>

            <div className="qr-display-canvas-wrapper">
                <canvas ref={canvasRef}></canvas>
            </div>

            {expiresAt && (
                <div className="qr-display-expiry">
                    <p className="expiry-label">⏰ Berlaku hingga:</p>
                    <p className="expiry-time">{formatDate(expiresAt)}</p>
                </div>
            )}

            <div className="qr-display-hint">
                Scan QR code ini untuk melakukan absensi
            </div>
        </div>
    );
}
