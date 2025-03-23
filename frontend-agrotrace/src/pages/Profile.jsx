import { useState, useEffect } from 'react';
import { useReadContract, useConnect } from "thirdweb/react";
import { FormContainer } from '../components/FormComponents';
// import Navbar from '../components/NavBar';
import { contract } from '../client';

const Profile = () => {
  const { data: wallet } = useConnect();
  const [profileAddress, setProfileAddress] = useState('');
  
  // Set the connected wallet address as the default profile to view
  useEffect(() => {
    if (wallet?.account.address) {
      setProfileAddress(wallet.account.address);
    }
  }, [wallet]);

  // Get role of the address
  const { data: role, isPending: roleLoading } = useReadContract({
    contract,
    method: "function getRole(address _wallet) view returns (string)",
    params: profileAddress ? [profileAddress] : undefined,
    enabled: !!profileAddress,
  });

  // Get farmer details if the role is "Farmer"
  const { data: farmerDetails, isPending: farmerLoading } = useReadContract({
    contract,
    method: "function getFarmerDetails(address _wallet) view returns ((string name, string addressDetails, string email, string phoneNumber, string citizenshipId, string photoLink, string location))",
    params: profileAddress && role === "Farmer" ? [profileAddress] : undefined,
    enabled: !!profileAddress && role === "Farmer",
  });

  // Get agro trader details if the role is "AgroTrader"
  const { data: agroTraderDetails, isPending: agroTraderLoading } = useReadContract({
    contract,
    method: "function getAgroTraderDetails(address _wallet) view returns ((string businessName, string email, string phoneNumber, string panVatNumber, string warehouseLocation))",
    params: profileAddress && role === "AgroTrader" ? [profileAddress] : undefined,
    enabled: !!profileAddress && role === "AgroTrader",
  });

  const handleAddressChange = (e) => {
    setProfileAddress(e.target.value);
  };

  return (
    <>
      <Navbar />
      <FormContainer title="Profile Details">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wallet Address
          </label>
          <input
            type="text"
            value={profileAddress}
            onChange={handleAddressChange}
            placeholder="Enter wallet address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-emerald-500"
          />
        </div>

        {roleLoading ? (
          <div className="p-4 text-center">Loading role information...</div>
        ) : role ? (
          <div className="mb-4 p-4 bg-emerald-50 rounded-md">
            <h3 className="font-bold text-emerald-700">Role: {role}</h3>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <p>No role found for this address. This address has not registered yet.</p>
          </div>
        )}

        {/* Farmer Details */}
        {role === "Farmer" && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">Farmer Details</h3>
            {farmerLoading ? (
              <div className="p-4 text-center">Loading farmer details...</div>
            ) : farmerDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Name</p>
                  <p>{farmerDetails.name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Address</p>
                  <p>{farmerDetails.addressDetails}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Email</p>
                  <p>{farmerDetails.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Phone</p>
                  <p>{farmerDetails.phoneNumber}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Citizenship ID</p>
                  <p>{farmerDetails.citizenshipId}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Location</p>
                  <p>{farmerDetails.location}</p>
                </div>
                {farmerDetails.photoLink && (
                  <div className="col-span-2 p-3 bg-gray-50 rounded-md">
                    <p className="font-semibold">Photo</p>
                    <img 
                      src={farmerDetails.photoLink} 
                      alt="Farmer" 
                      className="mt-2 max-h-48 rounded-md"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/100/100'; // Fallback placeholder
                        e.target.alt = 'Photo not available';
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Could not load farmer details.
              </div>
            )}
          </div>
        )}

        {/* AgroTrader Details */}
        {role === "AgroTrader" && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">AgroTrader Details</h3>
            {agroTraderLoading ? (
              <div className="p-4 text-center">Loading AgroTrader details...</div>
            ) : agroTraderDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Business Name</p>
                  <p>{agroTraderDetails.businessName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Email</p>
                  <p>{agroTraderDetails.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Phone</p>
                  <p>{agroTraderDetails.phoneNumber}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">PAN/VAT Number</p>
                  <p>{agroTraderDetails.panVatNumber}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Warehouse Location</p>
                  <p>{agroTraderDetails.warehouseLocation}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Could not load AgroTrader details.
              </div>
            )}
          </div>
        )}
      </FormContainer>
    </>
  );
};

export default Profile;