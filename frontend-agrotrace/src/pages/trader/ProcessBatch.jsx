import React, { useState, useEffect } from 'react';
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import { readContract } from "thirdweb";
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { productTraceabilityContract } from '../../client';

export default function ProcessBatch() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const account = useActiveAccount();
  const [batchDetails, setBatchDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for form data
  const [formData, setFormData] = useState({
    processingDate: "",
    packagingDate: "",
    storageConditions: "Refrigerated",
    finalPricePerKg: "",
    transportDetails: "Truck",
    qrCodeId: `QR-${Math.floor(Math.random() * 10000)}` // Initialize with a random QR code
  });

  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch batch details and check approval status
  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const cropBatch = await readContract({
          contract: productTraceabilityContract,
          method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
          params: [batchId],
        });

        const request = await readContract({
          contract: productTraceabilityContract,
          method: "function getProcessingRequest(uint256) view returns (uint256 batchId, address traderAddress, uint256 proposedFinalPrice, bool isApproved, bool isRejected, uint256 requestTimestamp)",
          params: [batchId],
        });

        if (!request || !request.isApproved || request.traderAddress.toLowerCase() !== account.address.toLowerCase()) {
          toast.error("This batch is not approved for processing");
          navigate("/trader/processing-requests");
          return;
        }

        setBatchDetails({
          productName: cropBatch[1],
          quantity: cropBatch[2],
          qualityGrade: cropBatch[3],
          harvestDate: cropBatch[4],
          farmLocation: cropBatch[5],
          basePricePerKg: cropBatch[6],
        });
      } catch (error) {
        console.error("Error fetching batch details:", error);
        toast.error("Failed to fetch batch details");
        navigate("/trader/processing-requests");
      } finally {
        setIsLoading(false);
      }
    };

    if (batchId && account?.address) {
      fetchBatchDetails();
    }
  }, [batchId, account?.address]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to regenerate QR code
  const handleRegenerateQR = () => {
    setFormData(prev => ({
      ...prev,
      qrCodeId: `QR-${Math.floor(Math.random() * 10000)}`
    }));
  };

  // Get minimum date for processing (harvest date)
  const getMinProcessingDate = () => {
    if (!batchDetails) return '';
    return new Date(batchDetails.harvestDate * 1000).toISOString().split('T')[0];
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
      const harvestDate = new Date(batchDetails.harvestDate * 1000);
      const today = new Date();

      if (processingDate < harvestDate) {
        toast.error("Processing date cannot be before harvest date");
        return;
      }

      if (packagingDate < processingDate) {
        toast.error("Packaging date cannot be before processing date");
        return;
      }

      if (processingDate > today || packagingDate > today) {
        toast.error("Dates cannot be in the future");
        return;
      }

      // Convert dates to timestamps
      const processingTimestamp = Math.floor(processingDate.getTime() / 1000);
      const packagingTimestamp = Math.floor(packagingDate.getTime() / 1000);

      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "function processBatch(uint256 _batchId, uint256 _processingDate, uint256 _packagingDate, string _storageConditions, uint256 _finalPricePerKg, string _transportDetails, string _qrCodeId)",
        params: [
          BigInt(batchId),
          BigInt(processingTimestamp),
          BigInt(packagingTimestamp),
          formData.storageConditions,
          BigInt(Math.round(formData.finalPricePerKg * 100)), // Convert to paisa
          formData.transportDetails,
          formData.qrCodeId
        ]
      });

      await sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Product processing details added successfully!");
          navigate("/trader/products");
        },
        onError: (error) => {
          console.error("Error processing batch:", error);
          toast.error(`Failed to process batch: ${error.message}`);
        }
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Please check your inputs and try again");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!batchDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Process Agricultural Product
        </h1>
        
        <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
          <h2 className="text-lg font-semibold text-emerald-700 mb-2">Batch Details</h2>
          <p><span className="font-medium">Product:</span> {batchDetails.productName}</p>
          <p><span className="font-medium">Quantity:</span> {batchDetails.quantity} kg</p>
          <p><span className="font-medium">Quality Grade:</span> {batchDetails.qualityGrade}</p>
          <p><span className="font-medium">Harvest Date:</span> {new Date(batchDetails.harvestDate * 1000).toLocaleDateString()}</p>
          <p><span className="font-medium">Base Price:</span> Rs. {batchDetails.basePricePerKg / 100} per kg</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              Must be after harvest date ({new Date(batchDetails.harvestDate * 1000).toLocaleDateString()}) and not in the future
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