import React from "react";
import { useReadContract, useContractEvents } from "thirdweb/react";
import { productTraceabilityContract } from "../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { prepareEvent } from "thirdweb";

export default function TraderProducts() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  console.log("Current account:", account?.address);

  // Prepare event listener for BatchProcessed
  const batchProcessedEvent = prepareEvent({
    signature: "event BatchProcessed(uint256 indexed batchId, address indexed trader)",
  });

  // Get all processed batch events
  const { data: processedEvents, isLoading: eventsLoading } = useContractEvents({
    contract: productTraceabilityContract,
    events: [batchProcessedEvent],
  });
  console.log("Processed events:", processedEvents);

  // Filter batches by current trader
  const traderBatches = React.useMemo(() => {
    if (!processedEvents || !account?.address) return [];
    return processedEvents.filter(event => 
      event.args.trader.toLowerCase() === account.address.toLowerCase()
    );
  }, [processedEvents, account?.address]);
  console.log("Trader batches:", traderBatches);

  // Get details for each processed batch
  const { data: processedDetails, isLoading: detailsLoading } = useReadContract({
    contract: productTraceabilityContract,
    method: "function processedBatches(uint256) view returns (address traderAddress, uint256 processingDate, uint256 packagingDate, string storageConditions, uint256 finalPricePerKg, string transportDetails, string qrCodeId)",
    params: traderBatches.map(batch => batch.args.batchId),
  });
  console.log("Processed details:", processedDetails);

  // Get original crop details for each batch
  const { data: cropDetails, isLoading: cropLoading } = useReadContract({
    contract: productTraceabilityContract,
    method: "function cropBatches(uint256) view returns (address farmerAddress, string productName, uint256 quantity, string qualityGrade, uint256 harvestDate, string farmLocation, uint256 basePricePerKg, string certificationNumber)",
    params: traderBatches.map(batch => batch.args.batchId),
  });
  console.log("Crop details:", cropDetails);

  // Combine processed and crop details
  const combinedBatchDetails = React.useMemo(() => {
    if (!processedDetails || !cropDetails) return [];

    // Convert array-like details to proper objects
    const processedObj = {
      traderAddress: processedDetails[0],
      processingDate: processedDetails[1],
      packagingDate: processedDetails[2],
      storageConditions: processedDetails[3],
      finalPricePerKg: processedDetails[4],
      transportDetails: processedDetails[5],
      qrCodeId: processedDetails[6]
    };

    const cropObj = {
      farmerAddress: cropDetails[0],
      productName: cropDetails[1],
      quantity: cropDetails[2],
      qualityGrade: cropDetails[3],
      harvestDate: cropDetails[4],
      farmLocation: cropDetails[5],
      basePricePerKg: cropDetails[6],
      certificationNumber: cropDetails[7]
    };

    return traderBatches.map((batch, index) => ({
      batchId: batch.args.batchId,
      processed: processedObj,
      crop: cropObj
    }));
  }, [traderBatches, processedDetails, cropDetails]);

  // Combined loading state
  const isLoading = eventsLoading || detailsLoading || cropLoading;

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
          ) : combinedBatchDetails.length === 0 ? (
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
                  {combinedBatchDetails.map(({ batchId, processed, crop }) => {
                    console.log(`Batch ${batchId}:`, { processed, crop });
                    return (
                      <tr key={batchId.toString()} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {batchId.toString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {crop.productName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {crop.farmerAddress 
                            ? `${crop.farmerAddress.slice(0, 6)}...${crop.farmerAddress.slice(-4)}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {processed.processingDate 
                            ? new Date(Number(processed.processingDate) * 1000).toLocaleDateString() 
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {processed.finalPricePerKg 
                            ? `Rs. ${Number(processed.finalPricePerKg) / 100}` 
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {processed.qrCodeId || "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}