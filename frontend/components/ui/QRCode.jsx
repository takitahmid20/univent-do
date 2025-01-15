// components/ui/QRCode.jsx
"use client";
import React from 'react';
import QRCodeReact from 'qrcode.react';
import { FaDownload, FaShareAlt } from 'react-icons/fa';

const QRCode = ({ value, size = 200, includeActions = true }) => {
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'event-qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const shareQRCode = async () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        const file = new File([blob], 'event-qr-code.png', { type: 'image/png' });
        const shareData = {
          files: [file],
          title: 'Event QR Code',
          text: 'Scan this QR code to access the event details'
        };

        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          throw new Error('Sharing not supported');
        }
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to download if sharing fails
        downloadQRCode();
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg">
      <QRCodeReact
        id="qr-code-canvas"
        value={value}
        size={size}
        level="H"
        includeMargin={true}
        renderAs="canvas"
      />
      
      {includeActions && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={downloadQRCode}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-[#f6405f] transition-colors"
          >
            <FaDownload />
            Download
          </button>
          <button
            onClick={shareQRCode}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-[#f6405f] transition-colors"
          >
            <FaShareAlt />
            Share
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCode;