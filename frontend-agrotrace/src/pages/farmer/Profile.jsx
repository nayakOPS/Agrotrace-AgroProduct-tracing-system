// src/pages/farmer/Profile.jsx
import { useReadContract } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "../../context/AuthContext";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaUserCircle } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function FarmerProfile() {
  const account = useActiveAccount();
  const { isFarmer } = useAuth();
  
  const { data: farmerDetails, isLoading } = useReadContract({
    contract: registrationContract,
    method: "function getFarmerDetails(address _wallet) view returns ((string name, string addressDetails, string email, string phoneNumber, string citizenshipId, string photoLink, string location))",
    params: [account?.address || ""],
  });

  // Function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isFarmer) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-medium">You are not registered as a farmer</p>
        </div>
      </div>
    );
  }

  if (!farmerDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-medium">No farmer details found</p>
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
                {farmerDetails.photoLink ? (
                  <img
                    src={farmerDetails.photoLink}
                    alt={farmerDetails.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 ${farmerDetails.photoLink ? 'hidden' : 'flex'}`}
                >
                  <div className="text-center">
                    <FaUserCircle className="w-16 h-16 text-white opacity-90" />
                    <span className="text-white text-lg font-semibold mt-1 block">
                      {getInitials(farmerDetails.name)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-20 pb-8 px-8">
            <h1 className="text-3xl font-bold text-gray-900">{farmerDetails.name}</h1>
            <p className="text-emerald-600 mt-1">Farmer</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUser className="text-emerald-500 mr-3" />
              Personal Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <FaEnvelope className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-gray-900">{farmerDetails.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaPhone className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900">{farmerDetails.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaIdCard className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Citizenship ID</p>
                  <p className="text-gray-900">{farmerDetails.citizenshipId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaMapMarkerAlt className="text-emerald-500 mr-3" />
              Location Details
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <FaHome className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{farmerDetails.addressDetails}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-emerald-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900">{farmerDetails.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}