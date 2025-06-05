import React, { useState, useEffect } from 'react';
import { useReadContract, useSendTransaction, useContractEvents } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import { readContract, prepareContractCall, prepareEvent } from "thirdweb";
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import RequestProcessingForm from '../../components/forms/RequestProcessingForm.jsx';
import ProcessBatchForm from '../../components/forms/ProcessBatchForm.jsx';
import { canRequestProcessing, formatCooldownTime } from '../../utils/requestValidation.js';
import { productTraceabilityContract, registrationContract } from '../../client';

const ProcessingRequests = () => {
  const account = useActiveAccount();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
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

  // Prepare transaction hooks
  const { mutate: sendApproveTransaction, isPending: isApprovePending } = useSendTransaction();
  const { mutate: sendRejectTransaction, isPending: isRejectPending } = useSendTransaction();

  // Fetch processing requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!batchCounter || !account?.address) return;
      
      try {
        setLoading(true);
        setError(null);
        const tempRequests = [];
        
        for (let i = 1; i <= batchCounter; i++) {
          try {
            // Get processing request
            const request = await readContract({
              contract: productTraceabilityContract,
              method: "function getProcessingRequest(uint256) view returns ((uint256 batchId, address traderAddress, uint256 proposedFinalPrice, bool isApproved, bool isRejected, uint256 requestTimestamp))",
              params: [i],
            });
            
            // Skip if no request exists
            if (!request || !request.traderAddress || request.traderAddress === "0x0000000000000000000000000000000000000000") {
              continue;
            }

            // Get crop batch details
            const cropBatch = await readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address farmerAddress, string productName, uint256 quantity, string qualityGrade, uint256 harvestDate, string farmLocation, uint256 basePricePerKg, string certificationNumber)",
              params: [i],
            });
            
            // Skip if no crop batch exists or if it's not for this farmer
            if (!cropBatch || !cropBatch[0] || 
                cropBatch[0].toLowerCase() !== account.address.toLowerCase()) {
              continue;
            }

            // Skip if request is already approved or rejected
            if (request.isApproved || request.isRejected) {
              continue;
            }

            // Get trader name
            let traderName = "Unknown Trader";
            try {
              const traderDetails = await readContract({
                contract: registrationContract,
                method: "function getAgroTraderDetails(address) view returns ((string businessName, string email, string phoneNumber, string panVatNumber, string warehouseLocation))",
                params: [request.traderAddress],
              });
              traderName = traderDetails.businessName || "Unknown Trader";
            } catch (error) {
              console.error("Error fetching trader name:", error);
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
              traderName: traderName
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

  const handleApprove = async (batchId) => {
    try {
      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "function approveProcessing(uint256 _batchId)",
        params: [batchId],
      });
      
      sendApproveTransaction(transaction, {
        onSuccess: () => {
          toast.success("Processing request approved successfully!");
          // Remove the approved request from the list immediately for better UX
          setRequests(requests.filter(req => req.batchId !== batchId));
        },
        onError: (error) => {
          toast.error("Failed to approve processing request");
          console.error(error);
        }
      });
    } catch (error) {
      toast.error("Failed to prepare transaction");
      console.error(error);
    }
  };

  const handleReject = async (batchId) => {
    try {
      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "function rejectProcessing(uint256 _batchId)",
        params: [batchId],
      });
      
      sendRejectTransaction(transaction, {
        onSuccess: () => {
          toast.success("Processing request rejected successfully!");
           // Remove the rejected request from the list immediately
          setRequests(requests.filter(req => req.batchId !== batchId));
        },
        onError: (error) => {
          toast.error("Failed to reject processing request");
          console.error(error);
        }
      });
    } catch (error) {
      toast.error("Failed to prepare transaction");
      console.error(error);
    }
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

  const calculatePriceDifference = (proposedPrice, basePrice) => {
    const diff = Number(proposedPrice) - Number(basePrice);
    // Ensure basePrice is not zero before calculating percentage
    const percentage = basePrice > 0 ? ((diff / Number(basePrice)) * 100).toFixed(1) : 0;
    
    return (
      <span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>
        ({diff >= 0 ? '+' : ''}{percentage}%) {/* Display percentage change */}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    return timestamp ? new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
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
                  <p className="text-gray-600">Trader: {batch.traderName}</p>
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
                  <p className="font-medium">{formatPrice(batch.request.proposedFinalPrice)}/kg {calculatePriceDifference(batch.request.proposedFinalPrice, batch.cropBatch.basePricePerKg)}</p>
                </div>
              </div>

              {batch.request.isRejected && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Cooldown Period Remaining</p>
                  {/* Use the utility function to display cooldown */}
                  {canRequestProcessing(batch.request).canRequest ? (
                     <p className="font-medium text-green-600">Ready to request again</p>
                  ) : (
                    <p className="font-medium text-yellow-600">
                       {formatCooldownTime(batch.request.requestTimestamp)}
                    </p>
                  )}

                </div>
              )}

              <div className="flex justify-end space-x-3">
                 {/* Only show buttons if request is pending */}
                {!batch.request.isApproved && !batch.request.isRejected && (
                   <>
                     <button
                       onClick={() => handleApprove(batch.batchId)}
                       disabled={isApprovePending || isRejectPending} // Disable while any action is pending
                       className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                     >
                       {isApprovePending ? 'Approving...' : 'Approve'}
                     </button>
                     <button
                       onClick={() => handleReject(batch.batchId)}
                        disabled={isApprovePending || isRejectPending} // Disable while any action is pending
                       className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                     >
                        {isRejectPending ? 'Rejecting...' : 'Reject'}
                     </button>
                   </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessingRequests;