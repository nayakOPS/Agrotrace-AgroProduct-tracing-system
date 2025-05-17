import React, { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction, useReadContract } from "thirdweb/react";
import { productTraceabilityContract } from "../../client";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { readContract } from "thirdweb";

// Helper function to convert BigInt to Number where needed
const convertBigInt = (value) => {
  return typeof value === 'bigint' ? Number(value) : value;
};

// Function to generate a random QR code identifier
const generateQRCode = () => {
  // Generate a random number between 1000 and 9999
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `QR-${randomNum}`;
};

// Helper function to format date for input[type="date"]
const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
};

export default function AddProduct() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const account = useActiveAccount();
  const [pendingBatches, setPendingBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // State for form data
  const [formData, setFormData] = useState({
    batchId: "",
    processingDate: "",
    packagingDate: "",
    storageConditions: "Refrigerated",
    finalPricePerKg: "",
    transportDetails: "Truck",
    qrCodeId: generateQRCode() // Initialize with a random QR code
  });

  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch batch counter
  const { data: batchCount } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  // Fetch pending batches
  useEffect(() => {
    if (!batchCount) return;

    const fetchPendingBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const batches = [];
        
        // Fetch all batches in parallel
        const batchPromises = [];
        for (let i = 1; i <= batchCount; i++) {
          batchPromises.push(
            readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
              params: [i],
            }).then(async (cropData) => {
              if (!cropData || !cropData[0]) return null;

              const processedData = await readContract({
                contract: productTraceabilityContract,
                method: "function processedBatches(uint256) view returns (address, uint256, uint256, string, uint256, string, string)",
                params: [i],
              });

              // Only include batches that haven't been processed yet
              if (!processedData || processedData[0] === "0x0000000000000000000000000000000000000000") {
                return {
                  batchId: i,
                  productName: cropData[1],
                  quantity: convertBigInt(cropData[2]),
                  qualityGrade: cropData[3],
                  harvestDate: convertBigInt(cropData[4]),
                };
              }
              return null;
            })
          );
        }

        const results = await Promise.all(batchPromises);
        const validBatches = results.filter(batch => batch !== null);
        setPendingBatches(validBatches);
      } catch (error) {
        console.error("Error fetching pending batches:", error);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    fetchPendingBatches();
  }, [batchCount]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'batchId') {
      const batch = pendingBatches.find(b => b.batchId.toString() === value);
      setSelectedBatch(batch);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to regenerate QR code
  const handleRegenerateQR = () => {
    setFormData(prev => ({
      ...prev,
      qrCodeId: generateQRCode()
    }));
  };

  // Get minimum date for processing (harvest date)
  const getMinProcessingDate = () => {
    if (!selectedBatch) return '';
    return formatDateForInput(selectedBatch.harvestDate);
  };

  // Get minimum date for packaging (processing date)
  const getMinPackagingDate = () => {
    if (!formData.processingDate) return '';
    return formData.processingDate;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate dates
      const processingDate = new Date(formData.processingDate);
      const packagingDate = new Date(formData.packagingDate);
      const harvestDate = new Date(selectedBatch.harvestDate * 1000);
      const today = new Date();

      if (processingDate < harvestDate) {
        alert("Processing date cannot be before harvest date");
        return;
      }

      if (packagingDate < processingDate) {
        alert("Packaging date cannot be before processing date");
        return;
      }

      if (processingDate > today || packagingDate > today) {
        alert("Dates cannot be in the future");
        return;
      }

      // Convert dates to timestamps
      const processingTimestamp = Math.floor(processingDate.getTime() / 1000);
      const packagingTimestamp = Math.floor(packagingDate.getTime() / 1000);

      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "function processBatch(uint256 _batchId, uint256 _processingDate, uint256 _packagingDate, string _storageConditions, uint256 _finalPricePerKg, string _transportDetails, string _qrCodeId)",
        params: [
          BigInt(formData.batchId),
          BigInt(processingTimestamp),
          BigInt(packagingTimestamp),
          formData.storageConditions,
          BigInt(Math.round(formData.finalPricePerKg * 100)), // Convert to paisa
          formData.transportDetails,
          formData.qrCodeId
        ]
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          alert("Product processing details added successfully!");
          navigate("/trader-dashboard");
        },
        onError: (error) => {
          console.error("Error processing batch:", error);
          alert(`Failed to process batch: ${error.message}`);
        }
      });
    } catch (error) {
      console.error("Validation error:", error);
      alert("Please check your inputs and try again");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Process Agricultural Product
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Batch to Process
            </label>
            {isLoadingBatches ? (
              <p className="mt-1 text-sm text-gray-500">Loading available batches...</p>
            ) : pendingBatches.length === 0 ? (
              <p className="mt-1 text-sm text-gray-500">No pending batches available for processing</p>
            ) : (
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select a batch</option>
                {pendingBatches.map((batch) => (
                  <option key={batch.batchId} value={batch.batchId}>
                    Batch #{batch.batchId} - {batch.productName} ({batch.quantity}kg, {batch.qualityGrade})
                  </option>
                ))}
              </select>
            )}
            {selectedBatch && (
              <p className="mt-1 text-sm text-gray-500">
                Harvest Date: {new Date(selectedBatch.harvestDate * 1000).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Processing Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Processing Date
            </label>
            <input
              type="date"
              name="processingDate"
              value={formData.processingDate}
              onChange={handleInputChange}
              min={getMinProcessingDate()}
              max={today}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be after harvest date ({selectedBatch ? new Date(selectedBatch.harvestDate * 1000).toLocaleDateString() : 'N/A'}) and not in the future
            </p>
          </div>

          {/* Packaging Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Packaging Date
            </label>
            <input
              type="date"
              name="packagingDate"
              value={formData.packagingDate}
              onChange={handleInputChange}
              min={getMinPackagingDate()}
              max={today}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be after processing date and not in the future
            </p>
          </div>

          {/* Storage Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Storage Conditions
            </label>
            <select
              name="storageConditions"
              value={formData.storageConditions}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="Refrigerated">Refrigerated</option>
              <option value="Cold Storage">Cold Storage</option>
              <option value="Room Temperature">Room Temperature</option>
              <option value="Controlled Atmosphere">Controlled Atmosphere</option>
            </select>
          </div>

          {/* Final Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Final Price (Rs/kg)
            </label>
            <input
              type="number"
              name="finalPricePerKg"
              min="0"
              step="0.01"
              value={formData.finalPricePerKg}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Transport Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transport Method
            </label>
            <select
              name="transportDetails"
              value={formData.transportDetails}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="Truck">Truck</option>
              <option value="Refrigerated Truck">Refrigerated Truck</option>
              <option value="Rail">Rail</option>
              <option value="Air Freight">Air Freight</option>
            </select>
          </div>

          {/* QR Code ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              QR Code Identifier
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="qrCodeId"
                value={formData.qrCodeId}
                readOnly
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                required
              />
              <button
                type="button"
                onClick={handleRegenerateQR}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              >
                Regenerate
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This QR code will be permanently associated with this batch on the blockchain
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
            >
              {isPending ? "Processing..." : "Submit Processing Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}