'use client';

import { FaTimes } from 'react-icons/fa';

export default function QRCodeModal({ isOpen, onClose, qrCode, eventTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Event QR Code
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          {eventTitle}
        </p>

        <div className="flex justify-center">
          {qrCode ? (
            <img
              src={qrCode}
              alt="Event QR Code"
              className="w-64 h-64"
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading QR code...</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 text-center">
            Show this QR code at the event entrance
          </p>
        </div>
      </div>
    </div>
  );
}
