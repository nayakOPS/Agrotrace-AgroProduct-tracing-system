import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveAccount } from 'thirdweb/react';
import { useReadContract, useSendTransaction, useContractRead, prepareContractCall } from 'thirdweb/react';
import { productTraceabilityContract } from '../../client';
import { convertBigInt, formatDate, formatAddress } from '../../utils/helpers';

export default function AvailableBatches() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [availableBatches, setAvailableBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Get batch counter
  const { data: batchCount } = useContractRead({
    contract: productTraceabilityContract,
    method: "batchCounter"
  });

  // Fetch available batches
  const fetchAvailableBatches = async () => {
    if (!batchCount) return;
    
    setIsLoading(true);
    try {
      const batches = [];
      
      // Fetch all batches in parallel
      const batchPromises = [];
      for (let i = 1; i <= batchCount; i++) {
        batchPromises.push(
          useContractRead({
            contract: productTraceabilityContract,
            method: "cropBatches",
            params: [i]
          }).then(async (cropData) => {
            if (!cropData || !cropData[0]) return null;

            // Check if batch has been processed
            const processedData = await useContractRead({
              contract: productTraceabilityContract,
              method: "processedBatches",
              params: [i]
            });

            // Check if there's already a bid
            const bidData = await useContractRead({
              contract: productTraceabilityContract,
              method: "traderBids",
              params: [i]
            });

            // Only include batches that haven't been processed and don't have a bid
            if (!processedData[0] && !bidData[0]) {
              return {
                batchId: i,
                productName: cropData[1],
                quantity: convertBigInt(cropData[2]),
                qualityGrade: cropData[3],
                harvestDate: formatDate(cropData[4]),
                farmLocation: cropData[5],
                basePricePerKg: convertBigInt(cropData[6]),
                certificationNumber: cropData[7],
                farmerAddress: formatAddress(cropData[0])
              };
            }
            return null;
          })
        );
      }

      const results = await Promise.all(batchPromises);
      const validBatches = results.filter(batch => batch !== null);
      setAvailableBatches(validBatches);
    } catch (error) {
      console.error("Error fetching available batches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableBatches();
  }, [batchCount]);

  // Handle bid submission
  const handleBidSubmit = async (batchId) => {
    if (!bidAmount || !selectedBatch) return;

    try {
      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "placeBid",
        params: [
          BigInt(batchId),
          BigInt(Math.round(parseFloat(bidAmount) * 100)) // Convert to paisa
        ]
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          alert("Bid placed successfully!");
          setBidAmount('');
          setSelectedBatch(null);
          // Refresh the available batches list
          fetchAvailableBatches();
        },
        onError: (error) => {
          console.error("Error placing bid:", error);
          alert(`Failed to place bid: ${error.message}`);
        }
      });
    } catch (error) {
      console.error("Error preparing transaction:", error);
      alert("Please check your inputs and try again");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-emerald-700">Available Crop Batches</h1>
            <button
              onClick={() => navigate("/trader/dashboard")}
              className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-emerald-700">Loading available batches...</p>
            </div>
          ) : availableBatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No crop batches available for bidding.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableBatches.map((batch) => (
                    <tr key={batch.batchId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {batch.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {batch.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {batch.quantity} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {batch.qualityGrade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs. {batch.basePricePerKg / 100}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {selectedBatch?.batchId === batch.batchId ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder="Enter bid amount"
                              className="w-32 px-2 py-1 border rounded"
                              min={batch.basePricePerKg / 100}
                              step="0.01"
                            />
                            <button
                              onClick={() => handleBidSubmit(batch.batchId)}
                              disabled={isPending}
                              className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isPending ? 'Placing Bid...' : 'Place Bid'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBatch(null);
                                setBidAmount('');
                              }}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedBatch(batch)}
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            Place Bid
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
    </div>
  );
} 