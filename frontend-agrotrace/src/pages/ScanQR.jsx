import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { 
  FaQrcode, 
  FaCamera, 
  FaCameraRetro, 
  FaBan, 
  FaCheckCircle, 
  FaUser, 
  FaBoxOpen, 
  FaIdCard, 
  FaUserTie, 
  FaCertificate, 
  FaCalendarAlt, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaMoneyBillAlt, 
  FaLink, 
  FaSyncAlt, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { MdOutlineQrCodeScanner } from 'react-icons/md';
import { formatDate, formatPrice } from '../utils/helpers';

const ScanQR = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [productData, setProductData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        setLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasPermission(true);
        setCameraError(null);
      } catch (err) {
        console.error('Camera permission error:', err);
        setHasPermission(false);
        setCameraError(err.message || 'Camera access denied');
        toast.error('Camera access denied. Please allow camera access and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (scanning) {
      requestCameraPermission();
    }
  }, [scanning]);

  const handleScan = (result) => {
    if (result && scanning) {
      try {
        const qrContent = result?.text;
        console.log("Raw QR Code Scanned Content:", qrContent);

        const data = JSON.parse(qrContent);

        setProductData({
          product: data.product,
          batchId: data.batchId,
          farmer: data.farmer,
          trader: data.trader,
          certification: data.certification,
          harvestDate: data.harvestDate,
          packagingDate: data.packagingDate,
          basePrice: data.basePrice.toFixed(2),
          finalPrice: data.finalPrice.toFixed(2),
          qrCodeId: data.qrCodeId,
          qualityGrade: data.qualityGrade
        });

        toast.success('QR Code scanned successfully!');
          setScanning(false);

      } catch (err) {
        console.error('Error parsing QR data:', err);
        toast.error('Invalid QR code data');
        setProductData(null);
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setCameraError(err.message || 'Error scanning QR code');
    toast.error('Error scanning QR code');
    setScanning(false);
  };

  const resetScanner = () => {
    setProductData(null);
    setScanning(true);
    setCameraError(null);
    setHasPermission(null);
  };

  const startScanner = () => {
    setScanning(true);
    setProductData(null);
    setCameraError(null);
    setHasPermission(null);
  };

  const stopScanner = () => {
    setScanning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto min-h-[calc(100vh-64px)] bg-white">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <FaQrcode className="mr-2" /> Scan QR Code
      </h1>

      {/* Start/Stop Camera Buttons */}
      {!productData && !loading && (
        <div className="mb-4 flex space-x-4">
          {!scanning && (
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center"
            >
              <FaCamera className="mr-2" /> Start Camera
            </button>
          )}
          {scanning && hasPermission && (
            <button
              onClick={stopScanner}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaBan className="mr-2" /> Stop Camera
            </button>
          )}
        </div>
      )}

      {/* Error Handling UI */}
      {(hasPermission === false || cameraError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 w-full text-center">
          {hasPermission === false ? (
            <>
              <h2 className="text-red-700 text-lg font-semibold mb-2 flex items-center justify-center">
                <FaBan className="mr-2" /> Camera access denied
              </h2>
              <p className="text-red-600 mb-2">
                Please allow camera access in your browser settings and try again.
              </p>
              <p className="text-sm text-red-500">
                <FaExclamationTriangle className="inline mr-1" />
                Camera access is required to scan QR codes.
              </p>
            </>
          ) : null}
          {cameraError && hasPermission !== false ? (
            <>
              <h2 className="text-red-700 text-lg font-semibold mb-2 flex items-center justify-center">
                <FaBan className="mr-2" /> Camera error
              </h2>
              <p className="text-red-600">{cameraError}</p>
            </>
          ) : null}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <LoadingSpinner />
      )}

      {/* QR Scanner */}
      {!productData && !loading && hasPermission !== false && !cameraError && scanning && (
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <div className="relative aspect-square">
              {hasPermission === null && (
                <div className="flex flex-col items-center justify-center p-4 h-full w-full absolute inset-0 bg-black bg-opacity-60 z-10">
                  <FaSyncAlt className="text-4xl text-gray-200 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-white">Requesting camera access...</h3>
                </div>
              )}
              {hasPermission === true && scanning && !cameraError && (
                <QrReader
                  constraints={{ facingMode: 'environment' }}
                  onResult={handleScan}
                  onError={handleError}
                  className="w-full h-full"
                />
              )}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-2 border-dashed border-white pointer-events-none"></div>
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">
                <MdOutlineQrCodeScanner className="inline mr-1" />
                Position QR code within the frame to scan
              </p>
              {hasPermission && !cameraError && (
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <div className="animate-pulse flex items-center">
                    <FaSyncAlt className="animate-spin mr-1" />
                    Scanning for QR code...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Details */}
      {productData && !loading && (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 w-full">
            <div className="flex items-center justify-center text-emerald-700 text-lg font-semibold mb-2">
              <FaCheckCircle className="mr-2" />
              QR Code scanned successfully!
            </div>
            <button 
              onClick={resetScanner} 
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center"
            >
              <FaCameraRetro className="mr-2" /> Scan Again
            </button>
          </div>

          <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-emerald-500 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  <FaBoxOpen className="inline mr-2" />
                  Product Details
                </h2>
                <span className="px-3 py-1 bg-white text-emerald-500 rounded-full text-sm font-bold">
                  {productData.qualityGrade}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaBoxOpen className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Product</p>
                      <p className="font-medium">{productData.product}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaIdCard className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Batch ID</p>
                      <p className="font-medium">{productData.batchId}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaUser className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Farmer</p>
                      <p className="font-medium">{productData.farmer}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaUserTie className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trader</p>
                      <p className="font-medium">{productData.trader}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaCertificate className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Certification</p>
                      <p className="font-medium">{productData.certification}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Harvest Date</p>
                      <p className="font-medium">{productData.harvestDate}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaCalendarCheck className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Packaging Date</p>
                      <p className="font-medium">{productData.packagingDate}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaMoneyBillAlt className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Base Price</p>
                      <p className="font-medium">₹{productData.basePrice}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Final Price</p>
                      <p className="font-medium">₹{productData.finalPrice}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <FaQrcode className="text-emerald-500 mr-2" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">QR Code ID</p>
                      <p className="font-medium">{productData.qrCodeId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <FaLink className="text-emerald-500 mr-2" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Scan URL</p>
                    <p className="text-emerald-500 break-all">
                      {`${window.location.origin}/scan-qr`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScanQR;