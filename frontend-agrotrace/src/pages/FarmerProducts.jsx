import React from "react";
import { useReadContract, useContractEvents } from "thirdweb/react";
import { productTraceabilityContract } from "../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { prepareEvent } from "thirdweb";
import { readContract } from "thirdweb";

// Helper function to convert BigInt to Number where needed
const convertBigInt = (value) => {
  return typeof value === 'bigint' ? Number(value) : value;
};

export default function FarmerProducts() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const [allBatches, setAllBatches] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Get batch counter
  const { data: batchCount } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  // Fetch all batches when account or batchCount changes
  React.useEffect(() => {
    if (!account?.address || !batchCount) return;

    const fetchAllBatches = async () => {
      setIsLoading(true);
      try {
        const batches = [];
        
        // Fetch all batches in parallel
        const batchPromises = [];
        for (let i = 1; i <= batchCount; i++) {
          batchPromises.push(
            readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
              params: [i],
            }).then(async (cropData) => {
              console.log('Raw cropDetails for batch', i, ':', cropData);
              
              // Skip if no data or empty farmer address
              if (!cropData || !cropData[0]) return null;

              // Only process batches belonging to this farmer
              if (cropData[0].toLowerCase() === account.address.toLowerCase()) {
                const processedData = await readContract({
                  contract: productTraceabilityContract,
                  method: "function processedBatches(uint256) view returns (address, uint256, uint256, string, uint256, string, string)",
                  params: [i],
                });

                console.log('Processed details for batch', i, ':', processedData);

                // Structure the data properly
                const cropDetails = {
                  farmerAddress: cropData[0],
                  productName: cropData[1],
                  quantity: convertBigInt(cropData[2]),
                  qualityGrade: cropData[3],
                  harvestDate: convertBigInt(cropData[4]),
                  farmLocation: cropData[5],
                  basePricePerKg: convertBigInt(cropData[6]),
                  certificationNumber: cropData[7]
                };

                const isProcessed = processedData && processedData[0] !== "0x0000000000000000000000000000000000000000";

                return {
                  batchId: i,
                  cropDetails,
                  isProcessed
                };
              }
              return null;
            })
          );
        }

        // Wait for all promises and filter out nulls
        const results = await Promise.all(batchPromises);
        const validBatches = results.filter(batch => batch !== null);
        console.log('Fetched batches:', validBatches);
        setAllBatches(validBatches);
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBatches();
  }, [account?.address, batchCount]);

  // Listen for new events to update UI in real-time
  const newCropEvent = prepareEvent({
    signature: "event NewCropBatch(uint256 indexed batchId, address indexed farmer)",
  });

  const { data: cropEvents } = useContractEvents({
    contract: productTraceabilityContract,
    events: [newCropEvent],
  });

  // Handle new events
  React.useEffect(() => {
    if (cropEvents?.length && account?.address && !isLoading) {
      const newBatch = cropEvents.find(
        event => event.args.farmer.toLowerCase() === account.address.toLowerCase()
      );

      if (newBatch && !allBatches.some(b => b.batchId === newBatch.args.batchId)) {
        const fetchNewBatch = async () => {
          try {
            const cropData = await readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
              params: [newBatch.args.batchId],
            });

            const processedData = await readContract({
              contract: productTraceabilityContract,
              method: "function processedBatches(uint256) view returns (address, uint256, uint256, string, uint256, string, string)",
              params: [newBatch.args.batchId],
            });

            const cropDetails = {
              farmerAddress: cropData[0],
              productName: cropData[1],
              quantity: convertBigInt(cropData[2]),
              qualityGrade: cropData[3],
              harvestDate: convertBigInt(cropData[4]),
              farmLocation: cropData[5],
              basePricePerKg: convertBigInt(cropData[6]),
              certificationNumber: cropData[7]
            };

            const isProcessed = processedData && processedData[0] !== "0x0000000000000000000000000000000000000000";

            setAllBatches(prev => [
              ...prev,
              {
                batchId: newBatch.args.batchId,
                cropDetails,
                isProcessed
              }
            ]);
          } catch (error) {
            console.error("Error fetching new batch:", error);
          }
        };
        fetchNewBatch();
      }
    }
  }, [cropEvents, account?.address, isLoading]);

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
          ) : allBatches.length === 0 ? (
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
                  {allBatches.map(({ batchId, cropDetails, isProcessed }) => (
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
                          ? new Date(cropDetails.harvestDate * 1000).toLocaleDateString() 
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cropDetails.basePricePerKg 
                          ? `Rs. ${cropDetails.basePricePerKg / 100}` 
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