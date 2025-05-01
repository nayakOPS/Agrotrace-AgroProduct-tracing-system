// import React, { useState, useEffect } from "react";
// import { prepareContractCall, prepareEvent } from "thirdweb";
// import { useSendTransaction, useContractEvents } from "thirdweb/react";
// import { registrationContract } from "../../client";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// // Prepare the AgroTraderRegistered event
// const preparedEvent = prepareEvent({
//   signature: "event AgroTraderRegistered(address indexed agroTrader, string businessName)",
// });

// export default function RegisterTrader() {
//   const navigate = useNavigate();
//   const { mutate: sendTransaction, isPending } = useSendTransaction();
//   const { isTrader, account } = useAuth();
//   const [formData, setFormData] = useState({
//     businessName: "",
//     email: "",
//     phoneNumber: "",
//     panVatNumber: "",
//     warehouseLocation: "",
//   });

//   // Listen for the AgroTraderRegistered event
//   const { data: events } = useContractEvents({
//     contract: registrationContract,
//     events: [preparedEvent],
//   });

//   // Redirect if already registered as trader
//   useEffect(() => {
//     if (isTrader) {
//       navigate("/trader/dashboard");
//     }
//   }, [isTrader, navigate]);

//   // Check registration success
//   useEffect(() => {
//     if (events && events.length > 0 && account?.address) {
//       const latestEvent = events[events.length - 1];
//       if (latestEvent.args.agroTrader === account.address) {
//         alert("Agro Trader successfully registered!");
//         navigate("/trader/dashboard");
//       }
//     }
//   }, [events, account, navigate]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const transaction = prepareContractCall({
//       contract: registrationContract,
//       method: "function registerAgroTrader(string _businessName, string _email, string _phoneNumber, string _panVatNumber, string _warehouseLocation)",
//       params: [
//         formData.businessName,
//         formData.email,
//         formData.phoneNumber,
//         formData.panVatNumber,
//         formData.warehouseLocation,
//       ],
//     });

//     sendTransaction(transaction, {
//       onSuccess: () => {
//         alert("Agro Trader registration submitted! Waiting for confirmation...");
//       },
//       onError: (error) => {
//         console.error("Error registering agro trader:", error);
//         alert("Failed to register agro trader. Please try again.");
//       },
//     });
//   };

//   if (isTrader === null) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
//           Register as an Agro Trader
//         </h1>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Business Name
//             </label>
//             <input
//               type="text"
//               name="businessName"
//               value={formData.businessName}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               PAN/VAT Number
//             </label>
//             <input
//               type="text"
//               name="panVatNumber"
//               value={formData.panVatNumber}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Warehouse Location
//             </label>
//             <input
//               type="text"
//               name="warehouseLocation"
//               value={formData.warehouseLocation}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <button
//               type="submit"
//               disabled={isPending}
//               className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
//             >
//               {isPending ? "Registering..." : "Register"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">
            Sign Up as an Agro Trader
          </h1>
          <p className="mt-2 text-gray-600">
            Join our blockchain-based agricultural traceability system to source quality products directly from farmers
          </p>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 mb-6 border-l-4 border-emerald-500">
          <h2 className="text-lg font-medium text-emerald-800">Benefits for Agro Traders</h2>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            <li>• Direct access to verified farmers and their products</li>
            <li>• Complete transparency in product sourcing and history</li>
            <li>• Build consumer trust through QR code traceability</li>
            <li>• Digital proof of all your business transactions and certifications</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="Your registered company or business name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="company@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="98XXXXXXXX"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PAN/VAT Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="panVatNumber"
              value={formData.panVatNumber}
              onChange={handleInputChange}
              placeholder="Your business PAN or VAT registration number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">This will be used to verify your business registration with government records</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Warehouse Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="warehouseLocation"
              value={formData.warehouseLocation}
              onChange={handleInputChange}
              placeholder="Address of your main warehouse or processing facility"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering on Blockchain...
                </>
              ) : (
                "Complete Business Registration"
              )}
            </button>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">What happens next?</h3>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1 pl-1">
              <li>Your business information will be stored securely on the blockchain</li>
              <li>You'll gain access to the trader dashboard</li>
              <li>You can start sourcing products directly from registered farmers</li>
              <li>Generate QR codes for products to enable consumer traceability</li>
            </ol>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            By registering, you agree to share your business information on the blockchain for supply chain transparency.
            <br />This helps build trust between farmers, traders, and consumers in the agricultural ecosystem.
          </p>
        </form>
      </div>
    </div>
  );
}