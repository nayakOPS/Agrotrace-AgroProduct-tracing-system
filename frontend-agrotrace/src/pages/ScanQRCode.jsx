import React from 'react';
import QRCode from '../components/QRCode';

const ScanQRCode = () => {
  return (
    <div>
      <div style={{ padding: '30px' }}>
        <h1 style={{ color: '#4CAF50' }}>Scan QR Code</h1>
        <QRCode/>
      </div>
    </div>
  );
};

export default ScanQRCode;
