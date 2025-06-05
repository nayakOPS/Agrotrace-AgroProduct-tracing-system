// src/pages/trader/Profile.jsx
import { useReadContract } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "../../context/AuthContext";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaBuilding, FaUserCircle } from 'react-icons/fa';

export default function TraderProfile() {
  const account = useActiveAccount();
  const { isTrader } = useAuth();
  
  const { data: traderDetails, isLoading } = useReadContract({
    contract: registrationContract,
    method: "function getAgroTraderDetails(address _wallet) view returns ((string businessName, string email, string phoneNumber, string panVatNumber, string warehouseLocation))",
    params: [account?.address || ""],
  });

  // Function to get initials from business name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isTrader) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-medium">You are not registered as a trader</p>
        </div>
      </div>
    );
  }

  if (!traderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-medium">No trader details found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-emerald-500 to-teal-500">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
                  <div className="text-center">
                    <FaBuilding className="w-16 h-16 text-white opacity-90" />
                    <span className="text-white text-lg font-semibold mt-1 block">
                      {getInitials(traderDetails.businessName)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-20 pb-8 px-8">
            <h1 className="text-3xl font-bold text-gray-900">{traderDetails.businessName}</h1>
            <p className="text-emerald-600 mt-1">Agro Trader</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Business Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaBuilding className="text-emerald-500 mr-3" />
              Business Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <FaIdCard className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">PAN/VAT Number</p>
                  <p className="text-gray-900">{traderDetails.panVatNumber}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Warehouse Location</p>
                  <p className="text-gray-900">{traderDetails.warehouseLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUser className="text-emerald-500 mr-3" />
              Contact Details
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <FaEnvelope className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-gray-900">{traderDetails.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaPhone className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900">{traderDetails.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}