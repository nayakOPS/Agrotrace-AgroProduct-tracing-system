import React, { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction, useReadContract } from "thirdweb/react";
import { productTraceabilityContract } from "../../client";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { readContract } from "thirdweb";
import { toast } from "react-hot-toast";
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { canRequestProcessing } from '../../utils/requestValidation.js'; // Import the utility

// Helper function to convert BigInt to Number where needed
const convertBigInt = (value) => {
  return typeof value === 'bigint' ? Number(value) : value;
};

// Function to generate a random QR code identifier
const generateQRCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `QR-${result}`;
};

// Helper function to format date for input[type="date"]
const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
};

export default function RequestProcessing() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending: isSendingRequest } = useSendTransaction();
  const account = useActiveAccount();
  const [availableBatches, setAvailableBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [proposedFinalPrice, setProposedFinalPrice] = useState("");
  const [error, setError] = useState(null);

  // Get batch counter
  const { data: batchCount, isLoading: isLoadingBatchCount } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  // Fetch available batches (not yet processed and available for THIS trader to request)
  useEffect(() => {
    const fetchAvailableBatches = async () => {
      if (!batchCount || !account?.address) {
         setIsLoadingBatches(false); // Ensure loading is false if dependencies are missing
         return;
      }

      console.log("Fetching available batches. Total batch count:", Number(batchCount));

      setIsLoadingBatches(true);
      try {
        const batches = [];

        // Fetch all batches in parallel
        const batchPromises = [];
        const totalBatches = Number(batchCount);

        for (let i = 1; i <= totalBatches; i++) {
          batchPromises.push(
            readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
              params: [i],
            }).then(async (cropData) => {
              console.log(`Batch ${i} crop data:`, cropData);

               // If cropData is not valid or batch doesn't exist (farmer address is zero),
               // then this batch is not valid, skip.
               if (!cropData || cropData[0] === "0x0000000000000000000000000000000000000000") {
                  console.log(`Batch ${i} skipped: Invalid or non-existent crop data`);
                  return null;
               }

              // Check if already processed by fetching the full struct
              const processedData = await readContract({
                 contract: productTraceabilityContract,
                 method: "function processedBatches(uint256) view returns (address traderAddress, uint256 processingDate, uint256 packagingDate, string storageConditions, uint256 finalPricePerKg, string transportDetails, string qrCodeId)",
                 params: [i],
              });
               console.log(`Batch ${i} processed data:`, processedData);
              // Check the traderAddress field (index 0) of the returned data using array indexing
              const isProcessed = processedData && processedData[0] !== "0x0000000000000000000000000000000000000000";

              // If already processed, this batch is not available for request
              if (isProcessed) {
                 console.log(`Batch ${i} skipped: Already processed`);
                 return null;
              }

              // Check for existing processing request for THIS batch
              const processingRequest = await readContract({
                contract: productTraceabilityContract,
                method: "function getProcessingRequest(uint256) view returns ((uint256 batchId, address traderAddress, uint256 proposedFinalPrice, bool isApproved, bool isRejected, uint256 requestTimestamp))",
                params: [i],
              });
               console.log(`Batch ${i} processing request:`, processingRequest);

              const hasExistingRequestFromThisTrader = processingRequest && 
                                                       processingRequest.traderAddress.toLowerCase() === account.address.toLowerCase();

              // If there is an existing request from THIS trader that is NOT rejected (i.e., pending or approved),
              // this batch is NOT available for a NEW request from this trader.
              if (hasExistingRequestFromThisTrader && !processingRequest.isRejected) {
                 console.log(`Batch ${i} skipped: Pending or approved request exists from this trader`);
                 return null; // Already has a pending or approved request from this trader
              }

               // If we reach here, the batch is not processed, and either no request exists,
               // or the existing request is from a different trader,
               // or the existing request is from this trader but was rejected.

               console.log(`Batch ${i} available for request.`);

              return {
                batchId: i,
                productName: cropData[1],
                quantity: convertBigInt(cropData[2]),
                qualityGrade: cropData[3],
                harvestDate: convertBigInt(cropData[4]),
                basePricePerKg: convertBigInt(cropData[6]),
                 // Include the request details to check cooldown later in the UI if needed
                existingRequest: hasExistingRequestFromThisTrader ? processingRequest : null
              };
            })
          );
        }

        const results = await Promise.all(batchPromises);
        const validBatches = results.filter(batch => batch !== null);
        console.log("Valid batches available for request:", validBatches);
        setAvailableBatches(validBatches);
      } catch (error) {
        console.error("Error fetching available batches:", error);
        setError("Failed to load available batches.");
      } finally {
        setIsLoadingBatches(false);
      }
    };

    fetchAvailableBatches();
  }, [batchCount, account?.address]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'batchId') {
        setSelectedBatchId(value);
         // Optionally reset proposed price when batch changes
        setProposedFinalPrice("");
    } else if (name === 'proposedFinalPrice') {
        setProposedFinalPrice(value);
    }
    setError(null); // Clear error on input change
  };

  // Find selected batch details to get base price for validation
  const selectedBatchDetails = availableBatches.find(batch => batch.batchId.toString() === selectedBatchId);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedBatchId) {
        setError("Please select a batch.");
        return;
    }

    const proposedPriceNum = Number(proposedFinalPrice);
    if (isNaN(proposedPriceNum) || proposedPriceNum <= 0) {
      setError("Please enter a valid proposed final price greater than 0.");
      return;
    }

     // Perform cooldown check before sending transaction
     if (selectedBatchDetails?.existingRequest) {
         const { canRequest, reason } = canRequestProcessing(selectedBatchDetails.existingRequest);
         if (!canRequest) {
             setError(reason); // Show cooldown reason
             toast.error(reason); // Also show as a toast
             return;
         }
     }

    try {
      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "function requestProcessing(uint256 _batchId, uint256 _proposedFinalPrice)",
        params: [BigInt(selectedBatchId), BigInt(Math.round(proposedPriceNum * 100))]
      });

      await sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Processing request sent to farmer. Please wait for approval.");
          navigate("/trader/processing-requests");
        },
        onError: (error) => {
          console.error("Error requesting processing:", error);
          const errorMessage = error.message || "An unknown error occurred";
          const revertReasonMatch = errorMessage.match(/reverted with reason string '(.*?)'/);
          const revertReason = revertReasonMatch ? revertReasonMatch[1] : (error.data?.message || (error.data?.reason && `Reason: ${error.data.reason}`) || (error.data?.error?.message) || "");

          toast.error(`Failed to request processing: ${revertReason || errorMessage}`);
          setError(revertReason || errorMessage); // Set error state as well
        }
      });
    } catch (error) {
       console.error("Error preparing transaction:", error);
       toast.error(`Failed to prepare transaction: ${error.message || error}`);
       setError(error.message || error); // Set error state as well
    }
  };

  // Show loading spinner if fetching batch count or batches
  if (isLoadingBatchCount || isLoadingBatches) {
    return <LoadingSpinner />;
  }

   // Show a specific message if there are no available batches after loading
   if (!isLoadingBatches && availableBatches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 rounded-lg p-6 text-center shadow">
           <h3 className="text-lg font-semibold text-gray-700 mb-2">No Available Batches</h3>
          <p className="text-gray-600">There are currently no crop batches available for you to request processing for.</p>
        </div>
      </div>
    );
   }

   // Show error if loading batches failed and there are no available batches
  if (error && availableBatches.length === 0) {
     return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Batches</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
     );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl p-8 max-w-3xl mx-auto shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Request Processing</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Select Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Batch
              </label>
              <select
                required
                name="batchId"
                value={selectedBatchId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-8"
              >
                <option value="">-- Select a Batch --</option>
                {availableBatches.map((batch) => (
                  <option key={batch.batchId} value={batch.batchId.toString()}>
                    Batch #{batch.batchId.toString()} - {batch.productName} ({formatQuantity(batch.quantity)})
                  </option>
                ))}
              </select>
              {selectedBatchDetails && (
                  <p className="mt-2 text-sm text-gray-600">
                      Base Price: {formatPrice(selectedBatchDetails.basePricePerKg)}/kg, Harvested: {new Date(selectedBatchDetails.harvestDate * 1000).toLocaleDateString()}
                  </p>
              )}
            </div>

            {/* Proposed Final Price */}
            {selectedBatchId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Final Price (per kg)
              </label>
              <input
                type="number"
                step="0.01"
                required
                 min={0.01} // Allow any price >= 0.01
                name="proposedFinalPrice"
                value={proposedFinalPrice}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter proposed price..."
              />
            </div>
             )}

            {error && (
              <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSendingRequest || !selectedBatchId || !proposedFinalPrice}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingRequest ? 'Sending Request...' : 'Request Processing Permission'}
              </button>
            </div>
          </form>

      </div>
    </div>
  );
}

// Helper to format quantity (reused from ProcessingRequests)
const formatQuantity = (quantity) => {
    return quantity ? `${Number(quantity)} kg` : 'N/A';
};

// Helper to format price (reused from ProcessingRequests)
const formatPrice = (price) => {
    // Assuming price is in the smallest unit (paisa), divide by 100 for Rs.
    return price ? `Rs.${(Number(price) / 100).toFixed(2)}` : 'N/A';
};