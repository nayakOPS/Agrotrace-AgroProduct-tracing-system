import React, { useState, useEffect } from 'react';
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { toast } from 'react-hot-toast';
import { productTraceabilityContract } from '../../client';

// Helper function to generate a random alphanumeric QR code ID
const generateRandomQrCodeId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `QR-${result}`;
};

const ProcessBatchForm = ({ batch, onClose }) => {
  const [formData, setFormData] = useState({
    processingDate: '',
    packagingDate: '',
    storageConditions: '',
    transportDetails: '',
    qrCodeId: generateRandomQrCodeId(), // Generate initial QR code ID
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert harvestDate from BigInt to a Date object for validation
  const harvestDate = batch?.cropDetails?.harvestDate ? new Date(Number(batch.cropDetails.harvestDate) * 1000) : null;

  // Example options for dropdowns
  const storageOptions = ['Select Storage', 'Refrigerated', 'Room Temperature', 'Frozen', 'Controlled Atmosphere'];
  const transportOptions = ['Select Transport', 'Truck', 'Train', 'Ship', 'Air', 'Drone'];

  const { mutate: sendTransaction } = useSendTransaction();

  const validateForm = () => {
    if (!formData.processingDate || !formData.packagingDate) {
      setError('Processing and packaging dates are required.');
      return false;
    }
    
    const processingTimestamp = new Date(formData.processingDate).getTime(); // Milliseconds
    const packagingTimestamp = new Date(formData.packagingDate).getTime(); // Milliseconds
    const now = Date.now(); // Current time in milliseconds

    if (isNaN(processingTimestamp) || isNaN(packagingTimestamp)) {
        setError('Invalid date format.');
        return false;
    }

    // Validate Processing Date: Must be after harvest date and not in the future
    if (harvestDate && processingTimestamp < harvestDate.getTime()) {
        setError(`Processing date must be after harvest date: ${harvestDate.toLocaleDateString()}`);
        return false;
    }
    if (processingTimestamp > now) {
        setError('Processing date cannot be in the future.');
        return false;
    }

    // Validate Packaging Date: Must be after processing date and not in the future
    if (packagingTimestamp <= processingTimestamp) {
      setError('Packaging date must be after processing date.');
      return false;
    }
    if (packagingTimestamp > now) {
        setError('Packaging date cannot be in the future.');
        return false;
    }

    if (formData.storageConditions === 'Select Storage' || !formData.storageConditions.trim()) {
      setError('Please select storage conditions.');
      return false;
    }
    if (formData.transportDetails === 'Select Transport' || !formData.transportDetails.trim()) {
      setError('Please select transport details.');
      return false;
    }
    if (!formData.qrCodeId.trim()) {
      setError('QR Code ID is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "function processBatch(uint256 _batchId, uint256 _processingDate, uint256 _packagingDate, string _storageConditions, string _transportDetails, string _qrCodeId)",
        params: [
          BigInt(batch.batchId),
          BigInt(Math.floor(new Date(formData.processingDate).getTime() / 1000)), // Convert to seconds
          BigInt(Math.floor(new Date(formData.packagingDate).getTime() / 1000)), // Convert to seconds
          formData.storageConditions,
          formData.transportDetails,
          formData.qrCodeId,
        ],
      });
      
      await sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Batch processed successfully!");
          onClose();
        },
        onError: (error) => {
          toast.error(`Failed to process batch: ${error.message || error}`);
          console.error(error);
        }
      });
    } catch (error) {
      toast.error(`Failed to prepare transaction: ${error.message || error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQr = () => {
    setFormData(prev => ({ ...prev, qrCodeId: generateRandomQrCodeId() }));
  };

  return (
    <div className="bg-white rounded-xl p-8 w-full shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-green-700 mb-6">Process Batch</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Processing Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Date
            </label>
            <input
              type="date"
              required
              value={formData.processingDate}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  processingDate: e.target.value
                }));
                setError(null);
              }}
              max={new Date().toISOString().split('T')[0]} // Max date is today
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
             <p className="mt-1 text-sm text-gray-500">
              Must be after harvest date {harvestDate ? `(${harvestDate.toLocaleDateString()})` : ''} and not in the future
            </p>
          </div>
          
          {/* Packaging Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging Date
            </label>
            <input
              type="date"
              required
              value={formData.packagingDate}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  packagingDate: e.target.value
                }));
                setError(null);
              }}
              min={formData.processingDate} // Min date is the selected processing date
              max={new Date().toISOString().split('T')[0]} // Max date is today
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            <p className="mt-1 text-sm text-gray-500">Must be after processing date and not in the future</p>
          </div>
        </div>

        {/* Storage Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Storage Conditions
          </label>
          <select
            required
            value={formData.storageConditions}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                storageConditions: e.target.value
              }));
              setError(null);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-8"
          >
            {storageOptions.map(option => (
              <option key={option} value={option === 'Select Storage' ? '' : option} disabled={option === 'Select Storage'}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Transport Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transport Method
          </label>
          <select
            required
            value={formData.transportDetails}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                transportDetails: e.target.value
              }));
              setError(null);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-8"
          >
            {transportOptions.map(option => (
              <option key={option} value={option === 'Select Transport' ? '' : option} disabled={option === 'Select Transport'}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* QR Code Identifier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            QR Code Identifier
          </label>
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              readOnly
              value={formData.qrCodeId}
              className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleRegenerateQr}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-green-500 text-white text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Regenerate
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">This QR code will be permanently associated with this batch on the blockchain</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Process Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcessBatchForm; 