import React from "react";
import { useReadContract } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { data: traderDetails, isLoading } = useReadContract({
    contract:registrationContract,
    method:
      "function getAgroTraderDetails(address _wallet) view returns ((string businessName, string email, string phoneNumber, string panVatNumber, string warehouseLocation))",
    params: [account?.address || ""],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-emerald-700 text-lg">Loading...</p>
      </div>
    );
  }

  if (!traderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-red-600 text-lg">No trader details found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Agro Trader Dashboard
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <p className="mt-1 text-gray-900">{traderDetails.businessName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{traderDetails.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <p className="mt-1 text-gray-900">{traderDetails.phoneNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PAN/VAT Number</label>
            <p className="mt-1 text-gray-900">{traderDetails.panVatNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Warehouse Location</label>
            <p className="mt-1 text-gray-900">{traderDetails.warehouseLocation}</p>
          </div>
          <div>
            <button
              onClick={() => navigate("/trader/add-product")}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Add Agro Product Details
            </button>
            <button
              onClick={() => navigate("/trader/products")}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors mt-2"
            >
              View Processed Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}