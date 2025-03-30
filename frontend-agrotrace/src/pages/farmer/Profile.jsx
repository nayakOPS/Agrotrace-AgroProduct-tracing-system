// src/pages/farmer/Profile.jsx
import { useReadContract } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "../../context/AuthContext";

export default function FarmerProfile() {
  const account = useActiveAccount();
  const { isFarmer } = useAuth();
  
  const { data: farmerDetails, isLoading } = useReadContract({
    contract: registrationContract,
    method: "function getFarmerDetails(address _wallet) view returns ((string name, string addressDetails, string email, string phoneNumber, string citizenshipId, string photoLink, string location))",
    params: [account?.address || ""],
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isFarmer) {
    return <div className="min-h-screen flex items-center justify-center">You are not registered as a farmer</div>;
  }

  if (!farmerDetails) {
    return <div className="min-h-screen flex items-center justify-center">No farmer details found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-3xl font-bold text-emerald-700 mb-8">My Farmer Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-emerald-600">Personal Information</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Name:</span> {farmerDetails.name}</p>
                <p><span className="font-medium">Address:</span> {farmerDetails.addressDetails}</p>
                <p><span className="font-medium">Location:</span> {farmerDetails.location}</p>
                <p><span className="font-medium">Email:</span> {farmerDetails.email}</p>
                <p><span className="font-medium">Phone:</span> {farmerDetails.phoneNumber}</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-emerald-600">Identification</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Citizenship ID:</span> {farmerDetails.citizenshipId}</p>
                {/* {farmerDetails.photoLink && (
                  <div className="mt-4">
                    <img 
                      src={farmerDetails.photoLink} 
                      alt="Farmer" 
                      className="max-h-48 rounded-md border border-gray-200"
                      onError={(e) => {
                        e.target.src = '/placeholder-user.png';
                        e.target.alt = 'Photo not available';
                      }}
                    />
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}