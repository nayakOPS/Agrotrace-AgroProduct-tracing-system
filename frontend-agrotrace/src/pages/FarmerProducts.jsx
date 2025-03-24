import React from "react";
import { useReadContract, useContractEvents } from "thirdweb/react";
import { productTraceabilityContract } from "../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { prepareEvent } from "thirdweb";

export default function FarmerProducts() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  console.log("Current farmer account:", account?.address);

  // Prepare event listener for NewCropBatch
  const newCropEvent = prepareEvent({
    signature: "event NewCropBatch(uint256 indexed batchId, address indexed farmer)",
  });

  // Get all crop batch events
  const { data: cropEvents, isLoading: eventsLoading } = useContractEvents({
    contract: productTraceabilityContract,
    events: [newCropEvent],
  });
  console.log("All crop events:", cropEvents);

  // Filter batches by current farmer
  const farmerBatches = React.useMemo(() => {
    if (!cropEvents || !account?.address) return [];
    return cropEvents.filter(event => 
      event.args.farmer.toLowerCase() === account.address.toLowerCase()
    );
  }, [cropEvents, account?.address]);
  console.log("Farmer batches:", farmerBatches);

  // Get details for each crop batch
  const { data: cropDetails, isLoading: detailsLoading } = useReadContract({
    contract: productTraceabilityContract,
    method: "function cropBatches(uint256) view returns (address farmerAddress, string productName, uint256 quantity, string qualityGrade, uint256 harvestDate, string farmLocation, uint256 basePricePerKg, string certificationNumber)",
    params: farmerBatches.map(batch => batch.args.batchId),
  });
  console.log("Crop details:", cropDetails);

  // Get processing status for each batch
  const { data: processedStatus, isLoading: statusLoading } = useReadContract({
    contract: productTraceabilityContract,
    method: "function processedBatches(uint256) view returns (address traderAddress)",
    params: farmerBatches.map(batch => batch.args.batchId),
  });
  console.log("Processed status:", processedStatus);

  // Combine batch details
  const combinedBatchDetails = React.useMemo(() => {
    if (!cropDetails || !processedStatus) return [];

    // Convert array-like details to proper objects
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

    return farmerBatches.map((batch, index) => ({
      batchId: batch.args.batchId,
      cropDetails: cropObj,
      processedStatus: processedStatus[index]
    }));
  }, [farmerBatches, cropDetails, processedStatus]);

  // Combined loading state
  const isLoading = eventsLoading || detailsLoading || statusLoading;

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-emerald-700">My Crop Batches</h1>
            <button
              onClick={() => navigate("/farmer-dashboard")}
              className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-emerald-700">Loading crop details...</p>
            </div>
          ) : combinedBatchDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't added any crop batches yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {combinedBatchDetails.map(({ batchId, cropDetails, processedStatus }) => {
                    const isProcessed = processedStatus !== "0x0000000000000000000000000000000000000000";
                    
                    console.log(`Batch ${batchId}:`, { 
                      cropDetails, 
                      processedStatus 
                    });

                    return (
                      <tr key={batchId.toString()} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {batchId.toString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cropDetails.productName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cropDetails.quantity?.toString() || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cropDetails.qualityGrade || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cropDetails.harvestDate 
                            ? new Date(Number(cropDetails.harvestDate) * 1000).toLocaleDateString() 
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cropDetails.basePricePerKg 
                            ? `Rs. ${Number(cropDetails.basePricePerKg) / 100}` 
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isProcessed 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {isProcessed ? "Processed" : "Pending"}
                          </span>
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