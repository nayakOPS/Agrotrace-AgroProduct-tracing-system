import React, { useState, useEffect } from "react";
import { prepareContractCall, prepareEvent } from "thirdweb";
import { useSendTransaction, useContractEvents } from "thirdweb/react";
import { registrationContract } from "../../client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Prepare the AgroTraderRegistered event
const preparedEvent = prepareEvent({
  signature: "event AgroTraderRegistered(address indexed agroTrader, string businessName)",
});

export default function RegisterTrader() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const { isTrader, account } = useAuth();
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phoneNumber: "",
    panVatNumber: "",
    warehouseLocation: "",
  });

  // Listen for the AgroTraderRegistered event
  const { data: events } = useContractEvents({
    contract: registrationContract,
    events: [preparedEvent],
  });

  // Redirect if already registered as trader
  useEffect(() => {
    if (isTrader) {
      navigate("/trader/dashboard");
    }
  }, [isTrader, navigate]);

  // Check registration success
  useEffect(() => {
    if (events && events.length > 0 && account?.address) {
      const latestEvent = events[events.length - 1];
      if (latestEvent.args.agroTrader === account.address) {
        alert("Agro Trader successfully registered!");
        navigate("/trader/dashboard");
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
      method: "function registerAgroTrader(string _businessName, string _email, string _phoneNumber, string _panVatNumber, string _warehouseLocation)",
      params: [
        formData.businessName,
        formData.email,
        formData.phoneNumber,
        formData.panVatNumber,
        formData.warehouseLocation,
      ],
    });

    sendTransaction(transaction, {
      onSuccess: () => {
        alert("Agro Trader registration submitted! Waiting for confirmation...");
      },
      onError: (error) => {
        console.error("Error registering agro trader:", error);
        alert("Failed to register agro trader. Please try again.");
      },
    });
  };

  if (isTrader === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Register as an Agro Trader
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
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
              PAN/VAT Number
            </label>
            <input
              type="text"
              name="panVatNumber"
              value={formData.panVatNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Warehouse Location
            </label>
            <input
              type="text"
              name="warehouseLocation"
              value={formData.warehouseLocation}
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