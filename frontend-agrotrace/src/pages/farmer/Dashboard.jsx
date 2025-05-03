import React from "react";
import { useReadContract } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { data: farmerDetails, isLoading } = useReadContract({
    contract:registrationContract,
    method:
      "function getFarmerDetails(address _wallet) view returns ((string name, string addressDetails, string email, string phoneNumber, string citizenshipId, string photoLink, string location))",
    params: [account?.address || ""],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!farmerDetails) {
    return <div>No farmer details found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Farmer Dashboard
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{farmerDetails.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-gray-900">{farmerDetails.addressDetails}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{farmerDetails.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <p className="mt-1 text-gray-900">{farmerDetails.phoneNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Citizenship ID</label>
            <p className="mt-1 text-gray-900">{farmerDetails.citizenshipId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="mt-1">
              <img
                src={farmerDetails.photoLink}
                alt="Farmer Photo"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-gray-900">{farmerDetails.location}</p>
          </div>
          <div>
            <button
              onClick={() => navigate("/farmer/add-crop")}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Add Crop Details
            </button>
            <button
              onClick={() => navigate("/farmer/products")}
                            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors mt-2"
            >
              View My Crops
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}