import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, ChevronRight, Check, X, RefreshCcw } from 'lucide-react';

const QRCodeScanner = () => {
  const [scanMode, setScanMode] = useState(null); // 'camera', 'upload', or null
  const [isLoading, setIsLoading] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock data for agro product
  const productDetails = {
    productName: 'Organic Apples from Mustang',
    farmer: {
      name: 'Ram Bahadur Karki',
      location: 'Mustang, Nepal',
      contact: '+977 9876543210',
      pricePerKg: 'Rs. 150',
      certification: 'Organic Certified',
    },
    agroTrader: {
      name: 'GreenTrade Pvt. Ltd.',
      location: 'Kathmandu, Nepal',
      contact: '+977 1234567890',
      pricePerKg: 'Rs. 250',
    },
    timeline: [
      { date: '2025-01-05', event: 'Planted', location: 'Mustang' },
      { date: '2025-01-10', event: 'Harvested', location: 'Mustang' },
      { date: '2025-01-12', event: 'Quality Checked', location: 'Mustang' },
      { date: '2025-01-15', event: 'Packaged', location: 'Kathmandu' },
    ],
    qualityGrade: 'Premium',
    batchNumber: 'APP-2025-001',
  };

  // Start camera feed
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraPermission('granted');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraPermission('denied');
      setError("Camera access is required to scan QR codes. Please allow camera access and try again.");
    }
  };

  // Stop camera feed
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Handle camera mode selection
  const handleCameraMode = () => {
    setScanMode('camera');
    startCamera();
  };

  // Handle upload mode selection
  const handleUploadMode = () => {
    setScanMode('upload');
    stopCamera();
  };

  // Handle file upload for QR scanning
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileUploadError(null);
    
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setFileUploadError("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    // For demo purposes, we'll simulate QR code detection
    setIsLoading(true);
    setTimeout(() => {
      setScannedData(productDetails);
      setIsLoading(false);
    }, 1500);
  };

  // Simulated QR scan from camera
  const handleScanFromCamera = () => {
    setIsLoading(true);
    // In a real implementation, you would analyze video frames for QR codes
    // Here we just simulate finding a QR code after a delay
    setTimeout(() => {
      setScannedData(productDetails);
      setIsLoading(false);
      stopCamera();
    }, 1500);
  };

  // Reset everything
  const resetScan = () => {
    setScannedData(null);
    setIsLoading(false);
    setError(null);
    setScanMode(null);
    setFileUploadError(null);
    stopCamera();
  };

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-3">Trace Your Agro Product</h1>
          <div className="w-24 h-1 bg-emerald-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Scan the QR code to view the complete journey of your agricultural product from farm to table.
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* QR Scanner Section */}
              <div className="flex-1 flex flex-col items-center">
                <AnimatePresence mode="wait">
                  {!scanMode && !scannedData && (
                    <motion.div 
                      key="scan-options"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full max-w-xs"
                    >
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Choose Scan Method</h2>
                        
                        <button 
                          onClick={handleCameraMode}
                          className="w-full py-4 px-6 flex items-center justify-between bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors"
                        >
                          <div className="flex items-center">
                            <Camera className="mr-3" size={20} />
                            <span className="font-medium">Use Camera</span>
                          </div>
                          <ChevronRight size={18} />
                        </button>
                        
                        <button 
                          onClick={handleUploadMode}
                          className="w-full py-4 px-6 flex items-center justify-between bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors"
                        >
                          <div className="flex items-center">
                            <Upload className="mr-3" size={20} />
                            <span className="font-medium">Upload QR Code</span>
                          </div>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {scanMode === 'camera' && !scannedData && (
                    <motion.div 
                      key="camera-scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full"
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-72 h-72 bg-black rounded-xl overflow-hidden mb-6">
                          {/* Scanning border animation */}
                          {!isLoading && cameraPermission === 'granted' && (
                            <motion.div 
                              className="absolute inset-0 border-2 border-emerald-400 rounded-xl z-10 pointer-events-none"
                              initial={{ opacity: 0.5 }}
                              animate={{ 
                                opacity: [0.2, 0.8, 0.2],
                                boxShadow: [
                                  "0 0 0 0 rgba(16, 185, 129, 0)",
                                  "0 0 0 10px rgba(16, 185, 129, 0.3)",
                                  "0 0 0 0 rgba(16, 185, 129, 0)"
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          
                          {/* Camera feed */}
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Loading state */}
                          {isLoading && (
                            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-white text-sm">Reading QR Code...</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Camera error state */}
                          {cameraPermission === 'denied' && (
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center p-4">
                              <div className="text-center text-white">
                                <X size={40} className="mx-auto mb-2" />
                                <p>Camera access denied</p>
                                <p className="text-sm mt-2">Please allow camera access and try again</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={resetScan}
                            className="px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                          >
                            Back
                          </button>
                          
                          {cameraPermission === 'granted' && (
                            <button
                              onClick={handleScanFromCamera}
                              disabled={isLoading}
                              className={`px-6 py-2 rounded-lg font-medium ${isLoading ? 'bg-gray-300' : 'bg-emerald-600 hover:bg-emerald-700'} text-white transition-colors`}
                            >
                              {isLoading ? 'Scanning...' : 'Capture QR'}
                            </button>
                          )}
                          
                          {cameraPermission === 'denied' && (
                            <button
                              onClick={startCamera}
                              className="px-6 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center"
                            >
                              <RefreshCcw size={16} className="mr-2" /> Try Again
                            </button>
                          )}
                        </div>
                        
                        {error && (
                          <div className="mt-4 text-sm text-red-600 text-center max-w-xs">
                            {error}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {scanMode === 'upload' && !scannedData && (
                    <motion.div 
                      key="upload-scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full max-w-xs"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-72 h-72 border-2 border-dashed border-emerald-300 rounded-xl bg-emerald-50 flex flex-col items-center justify-center mb-6 p-6">
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleFileUpload}
                          />
                          
                          {isLoading ? (
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <p className="text-emerald-800 text-sm">Processing QR Code...</p>
                            </div>
                          ) : (
                            <>
                              <Upload size={40} className="text-emerald-400 mb-4" />
                              <h3 className="text-lg font-medium text-emerald-800 mb-2">Upload QR Code</h3>
                              <p className="text-sm text-emerald-600 text-center mb-4">
                                Upload a saved QR code image from your device
                              </p>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors text-sm"
                              >
                                Select Image
                              </button>
                              {fileUploadError && (
                                <p className="mt-3 text-xs text-red-600">{fileUploadError}</p>
                              )}
                            </>
                          )}
                        </div>
                        
                        <button
                          onClick={resetScan}
                          className="px-6 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {scannedData && (
                    <motion.div 
                      key="scan-success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full flex flex-col items-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                        <Check size={40} className="text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-medium text-emerald-800 mb-2">QR Code Scanned</h3>
                      <p className="text-emerald-600 mb-6">Product details retrieved successfully</p>
                      
                      <button
                        onClick={resetScan}
                        className="px-6 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors mb-4"
                      >
                        Scan Another
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Results Section */}
              <div className="flex-1">
                {scannedData ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="bg-emerald-50 p-6 rounded-xl">
                      <h2 className="text-2xl font-bold text-emerald-800 mb-4">Product Information</h2>
                      <div className="space-y-3">
                        <p><span className="font-semibold">Name:</span> {scannedData.productName}</p>
                        <p><span className="font-semibold">Batch:</span> {scannedData.batchNumber}</p>
                        <p><span className="font-semibold">Quality:</span> {scannedData.qualityGrade}</p>
                      </div>
                    </div>

                    <div className="bg-teal-50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-teal-800 mb-3">Product Journey</h3>
                      <div className="space-y-4">
                        {scannedData.timeline.map((item, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-start"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                          >
                            <div className="flex-shrink-0 w-3 h-3 bg-emerald-500 rounded-full mt-1.5 mr-3"></div>
                            <div>
                              <p className="font-medium">{item.event}</p>
                              <p className="text-sm text-gray-600">{item.date} • {item.location}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <motion.div 
                        className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h4 className="font-semibold text-emerald-700 mb-2">Farmer Details</h4>
                        <p className="font-medium text-gray-800">{scannedData.farmer.name}</p>
                        <p className="text-sm text-gray-600">{scannedData.farmer.location}</p>
                        <p className="text-sm text-gray-600 mt-1">{scannedData.farmer.contact}</p>
                        <p className="text-sm mt-2"><span className="font-medium">Price:</span> {scannedData.farmer.pricePerKg}</p>
                        {scannedData.farmer.certification && (
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded mt-2">
                            {scannedData.farmer.certification}
                          </span>
                        )}
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <h4 className="font-semibold text-teal-700 mb-2">Trader Details</h4>
                        <p className="font-medium text-gray-800">{scannedData.agroTrader.name}</p>
                        <p className="text-sm text-gray-600">{scannedData.agroTrader.location}</p>
                        <p className="text-sm text-gray-600 mt-1">{scannedData.agroTrader.contact}</p>
                        <p className="text-sm mt-2"><span className="font-medium">Price:</span> {scannedData.agroTrader.pricePerKg}</p>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-4">🔍</div>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">Ready to Scan</h3>
                      <p className="text-gray-500">Please select a scanning method to view complete product details and journey information.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;