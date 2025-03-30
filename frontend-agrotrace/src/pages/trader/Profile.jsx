// src/pages/trader/Profile.jsx
import { useReadContract } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "../../context/AuthContext";

export default function TraderProfile() {
  const account = useActiveAccount();
  const { isTrader } = useAuth();
  
  const { data: traderDetails, isLoading } = useReadContract({
    contract: registrationContract,
    method: "function getAgroTraderDetails(address _wallet) view returns ((string businessName, string email, string phoneNumber, string panVatNumber, string warehouseLocation))",
    params: [account?.address || ""],
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isTrader) {
    return <div className="min-h-screen flex items-center justify-center">You are not registered as a trader</div>;
  }

  if (!traderDetails) {
    return <div className="min-h-screen flex items-center justify-center">No trader details found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-3xl font-bold text-emerald-700 mb-8">My Trader Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-emerald-600">Business Information</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Business Name:</span> {traderDetails.businessName}</p>
                <p><span className="font-medium">Warehouse Location:</span> {traderDetails.warehouseLocation}</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-emerald-600">Contact Details</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Email:</span> {traderDetails.email}</p>
                <p><span className="font-medium">Phone:</span> {traderDetails.phoneNumber}</p>
                <p><span className="font-medium">PAN/VAT:</span> {traderDetails.panVatNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}