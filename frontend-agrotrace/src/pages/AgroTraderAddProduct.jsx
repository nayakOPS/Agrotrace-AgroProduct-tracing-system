import React, { useState } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction, useReadContract } from "thirdweb/react";
import { productTraceabilityContract } from "../client";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";

export default function AgroTraderAddProduct() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const account = useActiveAccount();

  // State for form data
  const [formData, setFormData] = useState({
    batchId: "",
    processingDate: "",
    packagingDate: "",
    storageConditions: "Refrigerated",
    finalPricePerKg: "",
    transportDetails: "Truck",
    qrCodeId: ""
  });

  // Fetch available batches (not yet processed)
  const { data: batchCount } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert dates to timestamps
      const processingTimestamp = Math.floor(new Date(formData.processingDate).getTime() / 1000);
      const packagingTimestamp = Math.floor(new Date(formData.packagingDate).getTime() / 1000);

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
          {/* Batch ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Batch ID (from farmer)
            </label>
            <input
              type="number"
              name="batchId"
              min="1"
              value={formData.batchId}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            {batchCount && (
              <p className="mt-1 text-sm text-gray-500">
                Available batches: 1 to {batchCount.toString()}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
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
            <input
              type="text"
              name="qrCodeId"
              value={formData.qrCodeId}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
              placeholder="QR-001"
            />
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