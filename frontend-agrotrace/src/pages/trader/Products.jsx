import React from "react";
import { useReadContract, useContractEvents } from "thirdweb/react";
import { productTraceabilityContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { prepareEvent } from "thirdweb";
import { readContract } from "thirdweb";
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';

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
  const [allBatches, setAllBatches] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showQRPopup, setShowQRPopup] = React.useState(false);
  const [currentBatch, setCurrentBatch] = React.useState(null);
  const [qrCodeId, setQrCodeId] = React.useState('');
  const [qrValue, setQrValue] = React.useState('');

  // Get batch counter
  const { data: batchCount } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  // Fetch all batches when account or batchCount changes
  React.useEffect(() => {
    if (!account?.address || !batchCount) return;

    const fetchAllBatches = async () => {
      setIsLoading(true);
      try {
        const batches = [];
        
        // Fetch all batches in parallel
        const batchPromises = [];
        for (let i = 1; i <= batchCount; i++) {
          batchPromises.push(
            readContract({
              contract: productTraceabilityContract,
              method: "function processedBatches(uint256) view returns (address, uint256, uint256, string, uint256, string, string)",
              params: [i],
            }).then(async (processedData) => {
              if (!processedData || !processedData[0]) return null;

              // Only process batches belonging to this trader
              if (processedData[0].toLowerCase() === account.address.toLowerCase()) {
                const cropData = await readContract({
                  contract: productTraceabilityContract,
                  method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
                  params: [i],
                });

                // Get complete product history for QR code value
                const productHistory = await readContract({
                  contract: productTraceabilityContract,
                  method: "function getProductHistory(uint256) view returns (address, address, string, uint256, uint256, uint256, uint256, string, string, string)",
                  params: [i],
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
                    farmer: productHistory[0],
                    trader: productHistory[1],
                    productName: productHistory[2],
                    basePrice: convertBigInt(productHistory[3]),
                    finalPrice: convertBigInt(productHistory[4]),
                    harvestDate: convertBigInt(productHistory[5]),
                    packagingDate: convertBigInt(productHistory[6]),
                    qualityGrade: productHistory[7],
                    certificationNumber: productHistory[8],
                    qrCodeId: productHistory[9]
                  }
                };
              }
              return null;
            })
          );
        }

        const results = await Promise.all(batchPromises);
        const uniqueBatches = results.filter(batch => batch !== null)
          .reduce((acc, current) => {
            const x = acc.find(item => item.batchId === current.batchId);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          console.log(uniqueBatches);
        setAllBatches(uniqueBatches);
      } catch (error) {
        console.error("Error fetching batches:", error);
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
  React.useEffect(() => {
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
              method: "function processedBatches(uint256) view returns (address, uint256, uint256, string, uint256, string, string)",
              params: [batchId],
            });

            const cropData = await readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
              params: [batchId],
            });

            const productHistory = await readContract({
              contract: productTraceabilityContract,
              method: "function getProductHistory(uint256) view returns (address, address, string, uint256, uint256, uint256, uint256, string, string, string)",
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
                farmer: productHistory[0],
                trader: productHistory[1],
                productName: productHistory[2],
                basePrice: convertBigInt(productHistory[3]),
                finalPrice: convertBigInt(productHistory[4]),
                harvestDate: convertBigInt(productHistory[5]),
                packagingDate: convertBigInt(productHistory[6]),
                qualityGrade: productHistory[7],
                certificationNumber: productHistory[8],
                qrCodeId: productHistory[9]
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
        method: "function getProductHistory(uint256) view returns (address, string, address, string, string, uint256, uint256, uint256, uint256, string, string, string)",
        params: [batchId],
      });

      // Find the batch in our state to get other details
      const batch = allBatches.find(b => b.batchId === batchId);
      if (!batch) return;

      const newQrCodeId = batch.processedDetails.qrCodeId || `batch-${batchId}`;
      setQrCodeId(newQrCodeId);
      
      // Create formatted QR code data in a human-readable format
      const harvestDate = formatDate(convertBigInt(productHistory[7]));
      const packagingDate = formatDate(convertBigInt(productHistory[8]));
      
      const qrData = {
        product: productHistory[4],
        farmer: productHistory[1], // Farmer's name
        trader: productHistory[3], // Trader's business name
        basePrice: convertBigInt(productHistory[5]) / 100,
        finalPrice: convertBigInt(productHistory[6]) / 100,
        harvestDate: harvestDate,
        packagingDate: packagingDate,
        qualityGrade: productHistory[9],
        certification: productHistory[10],
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
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-emerald-700">Loading product details...</p>
            </div>
          ) : uniqueBatchesToRender.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't processed any products yet.</p>
            </div>
          ) : (
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
                  {uniqueBatchesToRender.map(({ batchId, processedDetails, cropDetails }) => (
                    <tr key={`${batchId}-${cropDetails.productName}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {batchId.toString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cropDetails.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cropDetails.farmerAddress 
                          ? `${cropDetails.farmerAddress.slice(0, 6)}...${cropDetails.farmerAddress.slice(-4)}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {processedDetails.processingDate 
                          ? new Date(processedDetails.processingDate * 1000).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {processedDetails.finalPricePerKg 
                          ? `Rs. ${processedDetails.finalPricePerKg / 100}`
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
          )}
        </div>
      </div>
      <QRPopup />
    </div>
  );
}