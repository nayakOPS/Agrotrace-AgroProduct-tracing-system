import React, { useState, useEffect } from "react";
import { prepareContractCall, prepareEvent } from "thirdweb";
import { useSendTransaction, useContractEvents, useActiveAccount } from "thirdweb/react";
import { registrationContract } from "../client";
import { useNavigate } from "react-router-dom";

// Prepare the AgroTraderRegistered event
const preparedEvent = prepareEvent({
  signature: "event AgroTraderRegistered(address indexed agroTrader, string businessName)",
});

export default function RegisterAgroTrader() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phoneNumber: "",
    panVatNumber: "",
    warehouseLocation: "",
  });

  // Get the currently connected wallet address
  const account = useActiveAccount();
  const connectedAddress = account?.address;

  // Listen for the AgroTraderRegistered event
  const { data: events } = useContractEvents({
    contract:registrationContract,
    events: [preparedEvent],
  });

  // Check if the connected wallet address is already registered as a trader
  useEffect(() => {
    if (events && events.length > 0 && connectedAddress) {
      const latestEvent = events[events.length - 1];
      console.log("latestEvent details :", latestEvent.args);
      console.log("connectedAddress details :", connectedAddress);

      // Check if the agroTrader address in the event matches the connected wallet address
      if (latestEvent.args.agroTrader === connectedAddress) {
        console.log("User is already registered as an agro trader.");
        navigate("/trader-dashboard"); // Redirect to the Trader Dashboard
      }
    }
  }, [events, connectedAddress, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the transaction
    const transaction = prepareContractCall({
      registrationContract,
      method:
        "function registerAgroTrader(string _businessName, string _email, string _phoneNumber, string _panVatNumber, string _warehouseLocation)",
      params: [
        formData.businessName,
        formData.email,
        formData.phoneNumber,
        formData.panVatNumber,
        formData.warehouseLocation,
      ],
    });

    // Send the transaction
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

  // Check if the agro trader was successfully registered after form submission
  useEffect(() => {
    if (events && events.length > 0 && connectedAddress) {
      const latestEvent = events[events.length - 1];
      if (latestEvent.args.agroTrader === connectedAddress) {
        alert("Agro Trader successfully registered!");
        navigate("/trader-dashboard"); // Redirect to the Trader Dashboard
      }
    }
  }, [events, connectedAddress, navigate]);

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