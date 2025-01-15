'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaTimes } from 'react-icons/fa';

function QRScannerModal({ isOpen, onClose, event }) {
  const qrRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        // Success callback
        try {
          const scannedData = JSON.parse(decodedText);
          if (scannedData.eventId === event.id) {
            alert(`Verified: ${scannedData.attendeeName}`);
            html5QrCode.stop();
            onClose();
          } else {
            alert("Invalid ticket: Wrong event");
          }
        } catch (error) {
          alert("Invalid QR code");
        }
      },
      (error) => {
        // Error callback
        console.error("QR Code scanning failed:", error);
      }
    );

    // Cleanup
    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, [isOpen, event, onClose]);

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Event Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-gray-600">{event.date}</p>
        </div>

        {/* Scanner */}
        <div id="qr-reader" className="w-full aspect-square rounded-lg overflow-hidden" />
      </div>
    </div>
  ) : null;
}