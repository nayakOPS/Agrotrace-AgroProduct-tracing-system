import React, { useState, useEffect } from "react";
import { prepareContractCall, prepareEvent } from "thirdweb";
import { useSendTransaction, useContractEvents } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Prepare the FarmerRegistered event
const preparedEvent = prepareEvent({
  signature: "event FarmerRegistered(address indexed farmer, string name)",
});

export default function RegisterFarmer() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const { isFarmer, account } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    addressDetails: "",
    email: "",
    phoneNumber: "",
    citizenshipId: "",
    photoLink: "",
    location: "",
  });

  // Listen for the FarmerRegistered event
  const { data: events } = useContractEvents({
    contract: registrationContract,
    events: [preparedEvent],
  });

  // Redirect if already registered as farmer
  useEffect(() => {
    if (isFarmer) {
      navigate("/farmer/dashboard");
    }
  }, [isFarmer, navigate]);

  // Check registration success
  useEffect(() => {
    if (events && events.length > 0 && account?.address) {
      const latestEvent = events[events.length - 1];
      if (latestEvent.args.farmer === account.address) {
        alert("Farmer successfully registered!");
        navigate("/farmer/dashboard");
      }
    }
  }, [events, account, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const transaction = prepareContractCall({
      contract: registrationContract,
      method: "function registerFarmer(string _name, string _addressDetails, string _email, string _phoneNumber, string _citizenshipId, string _photoLink, string _location)",
      params: [
        formData.name,
        formData.addressDetails,
        formData.email,
        formData.phoneNumber,
        formData.citizenshipId,
        formData.photoLink,
        formData.location,
      ],
    });

    sendTransaction(transaction, {
      onSuccess: () => {
        alert("Farmer registration submitted! Waiting for confirmation...");
      },
      onError: (error) => {
        console.error("Error registering farmer:", error);
        alert("Failed to register farmer. Please try again.");
      },
    });
  };

  if (isFarmer === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Register as a Farmer
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="addressDetails"
              value={formData.addressDetails}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Citizenship ID
            </label>
            <input
              type="text"
              name="citizenshipId"
              value={formData.citizenshipId}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Photo Link
            </label>
            <input
              type="url"
              name="photoLink"
              value={formData.photoLink}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
            >
              {isPending ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}