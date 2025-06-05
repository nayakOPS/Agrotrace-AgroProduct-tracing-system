import React, { useState, useEffect } from 'react';
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { toast } from 'react-hot-toast';
import { productTraceabilityContract } from '../../client';

const RequestProcessingForm = ({ batchId, onClose, basePrice }) => {
  const [formData, setFormData] = useState({
    proposedFinalPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { mutate: sendTransaction } = useSendTransaction();

  const validateForm = () => {
    if (!formData.proposedFinalPrice || Number(formData.proposedFinalPrice) <= 0) {
      setError('Proposed price must be greater than 0');
      return false;
    }
    if (Number(formData.proposedFinalPrice) <= Number(basePrice)) {
      setError('Proposed price must be greater than base price');
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
        method: "function requestProcessing(uint256 _batchId, uint256 _proposedFinalPrice)",
        params: [batchId, formData.proposedFinalPrice],
      });
      
      await sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Processing request sent successfully!");
          onClose();
        },
        onError: (error) => {
          toast.error("Failed to send processing request");
          console.error(error);
        }
      });
    } catch (error) {
      toast.error("Failed to prepare transaction");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-xl font-semibold mb-4">Request Processing</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price (per kg)
          </label>
          <div className="text-lg font-medium text-gray-900">
            ${Number(basePrice).toFixed(2)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Proposed Final Price (per kg)
          </label>
          <input
            type="number"
            step="0.01"
            required
            min={Number(basePrice) + 0.01}
            value={formData.proposedFinalPrice}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                proposedFinalPrice: e.target.value
              }));
              setError(null);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter proposed price..."
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestProcessingForm; 