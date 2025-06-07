import React, { useState, useEffect } from "react";
import { useReadContract, useContractEvents } from "thirdweb/react";
import { productTraceabilityContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { prepareEvent } from "thirdweb";
import { readContract } from "thirdweb";
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { toast } from "react-hot-toast";
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { motion } from "framer-motion";

const convertBigInt = (value) => {
  return typeof value === 'bigint' ? Number(value) : value;
};

// Function to format date from UNIX timestamp to YYYY/MM/DD
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};

// Function to format addresses to be more readable
const formatAddress = (address) => {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Products() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const [allBatches, setAllBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [qrCodeId, setQrCodeId] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [error, setError] = useState(null);

  // Get batch counter
  const { data: batchCount, error: batchCountError } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  useEffect(() => {
    console.log("Batch Count:", batchCount?.toString());
    if (batchCountError) {
      console.error("Error fetching batch count:", batchCountError);
      setError("Failed to fetch batch count");
      setIsLoading(false);
      return;
    }
  }, [batchCount, batchCountError]);

  // Fetch all batches when account or batchCount changes
  useEffect(() => {
    if (!account?.address || !batchCount) return;

    const fetchAllBatches = async () => {
      setIsLoading(true);
      try {
        console.log("Starting to fetch batches...");
        const batches = [];
        
        // Fetch all batches in parallel
        const batchPromises = [];
        for (let i = 1; i <= Number(batchCount); i++) {
          batchPromises.push(
            readContract({
              contract: productTraceabilityContract,
              method: "function processedBatches(uint256) view returns (address traderAddress, uint256 processingDate, uint256 packagingDate, string storageConditions, uint256 finalPricePerKg, string transportDetails, string qrCodeId)",
              params: [i],
            }).then(async (processedData) => {
              if (!processedData || processedData[0] === "0x0000000000000000000000000000000000000000") {
                console.log(`Batch ${i}: No processed data or trader address is zero.`);
                return null;
              }

              console.log(`Batch ${i} - Contract Trader Address:`, processedData[0]);
              console.log(`Batch ${i} - Connected Account Address:`, account.address);
              console.log(`Batch ${i} - Addresses Match:`, processedData[0].toLowerCase() === account.address.toLowerCase());

              // Only process batches belonging to this trader
              if (processedData[0].toLowerCase() === account.address.toLowerCase()) {
                console.log(`Found processed batch ${i} for current trader.`);
                
                const cropData = await readContract({
                  contract: productTraceabilityContract,
                  method: "function cropBatches(uint256) view returns (address farmerAddress, string productName, uint256 quantity, string qualityGrade, uint256 harvestDate, string farmLocation, uint256 basePricePerKg, string certificationNumber)",
                  params: [i],
                });

                if (!cropData || cropData[0] === "0x0000000000000000000000000000000000000000") {
                  console.warn(`Batch ${i}: No crop data or farmer address is zero.`);
                  return null;
                }

                const productHistory = await readContract({
                  contract: productTraceabilityContract,
                  method: "function getProductHistory(uint256) view returns (((string farmerName, string traderName, string productName) names, (uint256 basePrice, uint256 finalPrice) prices, (uint256 harvestDate, uint256 packagingDate) dates, (string qualityGrade, string certificationNumber, string qrCodeId) quality))",
                  params: [i],
                });

                console.log(`Fetched complete data for batch ${i}:`, {
                  processed: processedData,
                  crop: cropData,
                  history: productHistory
                });

                return {
                  batchId: i,
                  processedDetails: {
                    traderAddress: processedData[0],
                    processingDate: convertBigInt(processedData[1]),
                    packagingDate: convertBigInt(processedData[2]),
                    storageConditions: processedData[3],
                    finalPricePerKg: convertBigInt(processedData[4]),
                    transportDetails: processedData[5],
                    qrCodeId: processedData[6]
                  },
                  cropDetails: {
                    farmerAddress: cropData[0],
                    productName: cropData[1],
                    quantity: convertBigInt(cropData[2]),
                    qualityGrade: cropData[3],
                    harvestDate: convertBigInt(cropData[4]),
                    farmLocation: cropData[5],
                    basePricePerKg: convertBigInt(cropData[6]),
                    certificationNumber: cropData[7]
                  },
                  productHistory: {
                    farmerName: productHistory.names.farmerName,
                    traderName: productHistory.names.traderName,
                    productName: productHistory.names.productName,
                    basePrice: convertBigInt(productHistory.prices.basePrice),
                    finalPrice: convertBigInt(productHistory.prices.finalPrice),
                    harvestDate: convertBigInt(productHistory.dates.harvestDate),
                    packagingDate: convertBigInt(productHistory.dates.packagingDate),
                    qualityGrade: productHistory.quality.qualityGrade,
                    certificationNumber: productHistory.quality.certificationNumber,
                    qrCodeId: productHistory.quality.qrCodeId
                  }
                };
              }
              return null;
            })
          );
        }

        const results = await Promise.all(batchPromises);
        const uniqueBatches = results.filter(batch => batch !== null);
        console.log("Final processed batches (filtered):", uniqueBatches);
        setAllBatches(uniqueBatches);
      } catch (error) {
        console.error("Error fetching batches:", error);
        setError("Failed to fetch batches");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBatches();
  }, [account?.address, batchCount]);

  // Listen for new events to update UI in real-time
  const batchProcessedEvent = prepareEvent({
    signature: "event BatchProcessed(uint256 indexed batchId, address indexed trader)",
  });

  const { data: processedEvents } = useContractEvents({
    contract: productTraceabilityContract,
    events: [batchProcessedEvent],
  });

  // Handle new events - modified to prevent duplicates
  useEffect(() => {
    if (!processedEvents?.length || !account?.address || isLoading) return;

    const handleNewBatch = async () => {
      const newBatches = await Promise.all(
        processedEvents
          .filter(event => event.args.trader.toLowerCase() === account.address.toLowerCase())
          .map(async (event) => {
            const batchId = event.args.batchId;
            
            // Skip if we already have this batch
            if (allBatches.some(b => b.batchId === batchId)) return null;

            const processedData = await readContract({
              contract: productTraceabilityContract,
              method: "function processedBatches(uint256) view returns (address traderAddress, uint256 processingDate, uint256 packagingDate, string storageConditions, uint256 finalPricePerKg, string transportDetails, string qrCodeId)",
              params: [batchId],
            });
            if (!processedData || processedData[0] === "0x0000000000000000000000000000000000000000") return null;

            const cropData = await readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address farmerAddress, string productName, uint256 quantity, string qualityGrade, uint256 harvestDate, string farmLocation, uint256 basePricePerKg, string certificationNumber)",
              params: [batchId],
            });
            if (!cropData || cropData[0] === "0x0000000000000000000000000000000000000000") return null;

            const productHistory = await readContract({
              contract: productTraceabilityContract,
              method: "function getProductHistory(uint256) view returns (((string farmerName, string traderName, string productName) names, (uint256 basePrice, uint256 finalPrice) prices, (uint256 harvestDate, uint256 packagingDate) dates, (string qualityGrade, string certificationNumber, string qrCodeId) quality))",
              params: [batchId],
            });

            return {
              batchId,
              processedDetails: {
                traderAddress: processedData[0],
                processingDate: convertBigInt(processedData[1]),
                packagingDate: convertBigInt(processedData[2]),
                storageConditions: processedData[3],
                finalPricePerKg: convertBigInt(processedData[4]),
                transportDetails: processedData[5],
                qrCodeId: processedData[6]
              },
              cropDetails: {
                farmerAddress: cropData[0],
                productName: cropData[1],
                quantity: convertBigInt(cropData[2]),
                qualityGrade: cropData[3],
                harvestDate: convertBigInt(cropData[4]),
                farmLocation: cropData[5],
                basePricePerKg: convertBigInt(cropData[6]),
                certificationNumber: cropData[7]
              },
              productHistory: {
                farmerName: productHistory.names.farmerName,
                traderName: productHistory.names.traderName,
                productName: productHistory.names.productName,
                basePrice: convertBigInt(productHistory.prices.basePrice),
                finalPrice: convertBigInt(productHistory.prices.finalPrice),
                harvestDate: convertBigInt(productHistory.dates.harvestDate),
                packagingDate: convertBigInt(productHistory.dates.packagingDate),
                qualityGrade: productHistory.quality.qualityGrade,
                certificationNumber: productHistory.quality.certificationNumber,
                qrCodeId: productHistory.quality.qrCodeId
              }
            };
          })
      );

      const validNewBatches = newBatches.filter(batch => batch !== null);
      if (validNewBatches.length > 0) {
        setAllBatches(prev => {
          // Combine and deduplicate batches
          const combined = [...prev, ...validNewBatches];
          return combined.reduce((acc, current) => {
            const x = acc.find(item => item.batchId === current.batchId);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
        });
      }
    };

    handleNewBatch();
  }, [processedEvents, account?.address, isLoading, allBatches]);

  // Create a unique list of batches for rendering
  const uniqueBatchesToRender = React.useMemo(() => {
    return allBatches.reduce((acc, current) => {
      const x = acc.find(item => item.batchId === current.batchId);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  }, [allBatches]);

  const handleGenerateQR = async (batchId) => {
    try {
      setIsLoading(true);
      
      // Fetch the complete product history for this batch
      const productHistory = await readContract({
        contract: productTraceabilityContract,
        method: "function getProductHistory(uint256) view returns (((string farmerName, string traderName, string productName) names, (uint256 basePrice, uint256 finalPrice) prices, (uint256 harvestDate, uint256 packagingDate) dates, (string qualityGrade, string certificationNumber, string qrCodeId) quality))",
        params: [batchId],
      });

      // Find the batch in our state to get other details
      const batch = allBatches.find(b => b.batchId === batchId);
      if (!batch) return;

      const newQrCodeId = batch.processedDetails.qrCodeId || `batch-${batchId}`;
      setQrCodeId(newQrCodeId);
      
      // Create formatted QR code data in a human-readable format
      const harvestDate = formatDate(convertBigInt(productHistory.dates.harvestDate));
      const packagingDate = formatDate(convertBigInt(productHistory.dates.packagingDate));
      
      const qrData = {
        product: productHistory.names.productName,
        farmer: productHistory.names.farmerName,
        trader: productHistory.names.traderName,
        basePrice: convertBigInt(productHistory.prices.basePrice) / 100,
        finalPrice: convertBigInt(productHistory.prices.finalPrice) / 100,
        harvestDate: harvestDate,
        packagingDate: packagingDate,
        qualityGrade: productHistory.quality.qualityGrade,
        certification: productHistory.quality.certificationNumber,
        qrCodeId: newQrCodeId,
        batchId: batchId,
        scanUrl: "http://localhost:5174/scan-qr"
      };
      
      setQrValue(JSON.stringify(qrData));
      setCurrentBatch(batch);
      setShowQRPopup(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    // Create a canvas element from the SVG
    const svg = document.getElementById("qr-code-svg");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    // Create a Blob from the SVG data
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const URL = window.URL || window.webkitURL || window;
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = function() {
      // Set canvas dimensions to match SVG
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the SVG on canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to PNG and download
      canvas.toBlob(function(blob) {
        saveAs(blob, `qr-code-${qrCodeId || currentBatch.batchId}.png`);
      });
    };
    
    img.src = url;
  };

  const QRPopup = () => {
    if (!showQRPopup || !currentBatch) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Generate QR Code</h3>
          
          <div className="mb-4">
            <label className="block mb-2">QR Code ID</label>
            <input
              type="text"
              value={qrCodeId}
              onChange={(e) => {
                const newId = e.target.value;
                setQrCodeId(newId);
                
                // Update QR value when ID changes, keeping the readable format
                setQrValue(qrValue.replace(/QR Code ID:.*$/m, `QR Code ID: ${newId}`));
              }}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex justify-center mb-4">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium mb-1">QR Code contains:</p>
            <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
              {(() => {
                try {
                  const data = JSON.parse(qrValue);
                  return Object.entries(data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
                } catch (e) {
                  return qrValue;
                }
              })()}
            </pre>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowQRPopup(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={downloadQRCode}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Download QR
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!allBatches.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Products Found</h2>
          <p className="text-gray-600">You haven't processed any products yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-emerald-700">Processed Products</h1>
            <button
              onClick={() => navigate("/trader-dashboard")}
              className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allBatches.map(({ batchId, processedDetails, cropDetails, productHistory }) => (
                  <tr key={`${batchId}-${cropDetails.productName}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {batchId.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cropDetails.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {productHistory.farmerName 
                        ? productHistory.farmerName
                        : formatAddress(cropDetails.farmerAddress)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {processedDetails.processingDate 
                        ? formatDate(processedDetails.processingDate)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {processedDetails.finalPricePerKg 
                        ? `Rs. ${(processedDetails.finalPricePerKg / 100).toFixed(2)}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {processedDetails.qrCodeId ? (
                        <button 
                          onClick={() => handleGenerateQR(batchId)}
                          className="text-emerald-600 hover:underline"
                        >
                          {processedDetails.qrCodeId}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateQR(batchId)}
                          className="text-emerald-600 hover:underline"
                        >
                          Generate QR
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code Attachment Demonstration Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6 text-center">How a QR Code is Attached</h2>
          <p className="text-gray-600 mb-8 text-center">
            Here's an example of how our QR codes are integrated into the product packaging to ensure traceability.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Before Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Before: Unmarked Product</h3>
              <div className="w-full max-w-sm h-64 flex items-center justify-center">
                <img
                  src="/fresh_tomato.jpg"
                  alt="Product before QR attachment"
                  className="w-full h-full object-contain rounded-md shadow-md"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                A fresh batch of produce, ready for packaging.
              </p>
            </motion.div>

            {/* After Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">After: QR Code Attached</h3>
              <div className="relative w-full max-w-sm h-64 flex items-center justify-center">
                <img
                  src="/tomatoes.webp"
                  alt="Product with QR attached"
                  className="w-full h-full object-contain rounded-md shadow-md"
                />
                <img
                  src="/dummy_qr.jpeg"
                  alt="Attached QR Code"
                  className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-white rounded-md shadow-lg object-contain"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                The product is now traceable with a unique QR code for consumers.
              </p>
            </motion.div>
          </div>
        </div>

        {showQRPopup && (
          <QRPopup />
        )}
      </div>
    </div>
  );
}