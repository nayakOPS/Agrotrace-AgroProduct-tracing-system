import React, { useState, useEffect } from 'react';
import { useReadContract, useSendTransaction, useContractEvents } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import { readContract, prepareContractCall, prepareEvent } from "thirdweb";
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ProcessBatchForm from '../../components/forms/ProcessBatchForm.jsx';
import { canRequestProcessing, formatCooldownTime } from '../../utils/requestValidation.js';
import { productTraceabilityContract, registrationContract } from '../../client';

const ProcessingRequests = () => {
  const account = useActiveAccount();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Prepare events for real-time updates
  const processingRequestedEvent = prepareEvent({
    signature: "event ProcessingRequested(uint256 indexed batchId, address indexed trader, uint256 proposedPrice)",
  });

  const processingApprovedEvent = prepareEvent({
    signature: "event ProcessingApproved(uint256 indexed batchId, address indexed trader)",
  });

  const processingRejectedEvent = prepareEvent({
    signature: "event ProcessingRejected(uint256 indexed batchId, address indexed trader)",
  });

  // Listen to contract events for real-time updates
  const { data: requestEvents } = useContractEvents({
    contract: productTraceabilityContract,
    events: [processingRequestedEvent, processingApprovedEvent, processingRejectedEvent],
  });

  // Get batch counter
  const { data: batchCounter, isError: batchCounterError } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  // Fetch processing requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!batchCounter || !account?.address) {
        setLoading(false); // Ensure loading is false if dependencies are missing
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const tempRequests = [];
        
        const totalBatches = Number(batchCounter);
        
        for (let i = 1; i <= totalBatches; i++) {
          try {
            // Get processing request
            const request = await readContract({
              contract: productTraceabilityContract,
              method: "function getProcessingRequest(uint256) view returns ((uint256 batchId, address traderAddress, uint256 proposedFinalPrice, bool isApproved, bool isRejected, uint256 requestTimestamp))",
              params: [i],
            });
            
            // Skip if no request exists or if it's not for this trader
            if (!request || !request.traderAddress || request.traderAddress === "0x0000000000000000000000000000000000000000" ||
                request.traderAddress.toLowerCase() !== account.address.toLowerCase()) {
              continue;
            }

            // Get crop batch details
            const cropBatch = await readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address farmerAddress, string productName, uint256 quantity, string qualityGrade, uint256 harvestDate, string farmLocation, uint256 basePricePerKg, string certificationNumber)",
              params: [i],
            });
            
            // Skip if no crop batch exists
            if (!cropBatch || !cropBatch[0] || cropBatch[0] === "0x0000000000000000000000000000000000000000") {
              continue;
            }

             // Get processed batch details to check if already processed
            const processedBatch = await readContract({
                 contract: productTraceabilityContract,
                 method: "function processedBatches(uint256) view returns (address traderAddress, uint256 processingDate, uint256 packagingDate, string storageConditions, uint256 finalPricePerKg, string transportDetails, string qrCodeId)",
                 params: [i],
              });

            // Skip if the batch has already been processed by ANY trader
             if (processedBatch && processedBatch[0] !== "0x0000000000000000000000000000000000000000") {
                continue;
             }

            // Get farmer name
            let farmerName = "Unknown Farmer";
            try {
              const farmerDetails = await readContract({
                contract: registrationContract,
                method: "function getFarmerDetails(address) view returns ((string name, string addressDetails, string email, string phoneNumber, string citizenshipId, string photoLink, string location))",
                params: [cropBatch[0]],
              });
              farmerName = farmerDetails.name || "Unknown Farmer";
            } catch (error) {
              console.error("Error fetching farmer name:", error);
            }

            tempRequests.push({
              batchId: i,
              request: {
                batchId: request.batchId,
                traderAddress: request.traderAddress,
                proposedFinalPrice: request.proposedFinalPrice,
                isApproved: request.isApproved,
                isRejected: request.isRejected,
                requestTimestamp: request.requestTimestamp
              },
              cropBatch: {
                farmerAddress: cropBatch[0],
                productName: cropBatch[1],
                quantity: cropBatch[2],
                qualityGrade: cropBatch[3],
                harvestDate: cropBatch[4],
                farmLocation: cropBatch[5],
                basePricePerKg: cropBatch[6],
                certificationNumber: cropBatch[7]
              },
              farmerName: farmerName
            });
          } catch (error) {
            console.error(`Error fetching request for batch ${i}:`, error);
            continue;
          }
        }
        setRequests(tempRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setError("Failed to fetch processing requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [batchCounter, account?.address, requestEvents]);

  const handleProcessClick = (batch) => {
     setSelectedBatch(batch);
     setShowProcessForm(true);
  };

  const handleCloseProcessForm = () => {
     setShowProcessForm(false);
     setSelectedBatch(null);
     // Optionally refetch requests after processing
     // fetchRequests();
  };

   // Helper to format price - dividing by 100 assuming smallest unit is paisa
  const formatPrice = (price) => {
    return price ? `Rs.${(Number(price) / 100).toFixed(2)}` : 'N/A';
  };

  const formatQuantity = (quantity) => {
    return quantity ? `${Number(quantity)} kg` : 'N/A';
  };

  const formatEthAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A';
  };

  const formatDate = (timestamp) => {
    return timestamp ? new Date(Number(timestamp) * 1000).toLocaleDateString() : 'N/A';
  };

  const getStatusBadge = (request) => {
    if (request.isApproved) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else if (request.isRejected) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Processing Requests</h2>
      
      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">No processing requests found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((batch) => (
            <div key={batch.batchId} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{batch.cropBatch.productName}</h3>
                  <p className="text-gray-600">Farmer: {batch.farmerName}</p>
                </div>
                {getStatusBadge(batch.request)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{formatQuantity(batch.cropBatch.quantity)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quality Grade</p>
                  <p className="font-medium">{batch.cropBatch.qualityGrade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Base Price</p>
                  <p className="font-medium">{formatPrice(batch.cropBatch.basePricePerKg)}/kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proposed Price</p>
                  {/* Removed price difference calculation here */}
                  <p className="font-medium">{formatPrice(batch.request.proposedFinalPrice)}/kg</p>
                </div>
              </div>

              {batch.request.isRejected && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Request rejected. You can request again after cooldown.</p>
                  {/* Use the utility function to display cooldown */}
                  {canRequestProcessing(batch.request).canRequest ? (
                     <p className="font-medium text-green-600">Ready to request again</p>
                  ) : (
                    <p className="font-medium text-yellow-600">
                       Cooldown ends: {formatCooldownTime(batch.request.requestTimestamp)}
                    </p>
                  )}

                </div>
              )}

              {batch.request.isApproved && !batch.request.isRejected && ( // Only show Process button if approved and not rejected
                <div className="flex justify-end">
                   <button
                     onClick={() => handleProcessClick(batch)} // Pass the batch data to the handler
                     className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                     disabled={showProcessForm} // Disable button while form is open
                   >
                     Process Batch
                   </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

       {/* Process Batch Form Modal */}
       {showProcessForm && selectedBatch && (
          <ProcessBatchForm
             batch={selectedBatch} // Pass selected batch data
             onClose={handleCloseProcessForm}
             onProcessed={() => {
                handleCloseProcessForm();
                // Optionally refetch requests or update state after processing
             }} 
          />
       )}
    </div>
  );
};

export default ProcessingRequests;