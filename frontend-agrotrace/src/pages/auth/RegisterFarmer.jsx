// import React, { useState, useEffect } from "react";
// import { prepareContractCall, prepareEvent } from "thirdweb";
// import { useSendTransaction, useContractEvents } from "thirdweb/react";
// import { registrationContract } from "../../client";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// // Prepare the FarmerRegistered event
// const preparedEvent = prepareEvent({
//   signature: "event FarmerRegistered(address indexed farmer, string name)",
// });

// export default function RegisterFarmer() {
//   const navigate = useNavigate();
//   const { mutate: sendTransaction, isPending } = useSendTransaction();
//   const { isFarmer, account } = useAuth();
//   const [formData, setFormData] = useState({
//     name: "",
//     addressDetails: "",
//     email: "",
//     phoneNumber: "",
//     citizenshipId: "",
//     photoLink: "",
//     location: "",
//   });

//   // Listen for the FarmerRegistered event
//   const { data: events } = useContractEvents({
//     contract: registrationContract,
//     events: [preparedEvent],
//   });

//   // Redirect if already registered as farmer
//   useEffect(() => {
//     if (isFarmer) {
//       navigate("/farmer/dashboard");
//     }
//   }, [isFarmer, navigate]);

//   // Check registration success
//   useEffect(() => {
//     if (events && events.length > 0 && account?.address) {
//       const latestEvent = events[events.length - 1];
//       if (latestEvent.args.farmer === account.address) {
//         alert("Farmer successfully registered!");
//         navigate("/farmer/dashboard");
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
//       method: "function registerFarmer(string _name, string _addressDetails, string _email, string _phoneNumber, string _citizenshipId, string _photoLink, string _location)",
//       params: [
//         formData.name,
//         formData.addressDetails,
//         formData.email,
//         formData.phoneNumber,
//         formData.citizenshipId,
//         formData.photoLink,
//         formData.location,
//       ],
//     });

//     sendTransaction(transaction, {
//       onSuccess: () => {
//         alert("Farmer registration submitted! Waiting for confirmation...");
//       },
//       onError: (error) => {
//         console.error("Error registering farmer:", error);
//         alert("Failed to register farmer. Please try again.");
//       },
//     });
//   };

//   if (isFarmer === null) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
//           Register/Sign Up as a Farmer
//         </h1>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Full Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Address
//             </label>
//             <input
//               type="text"
//               name="addressDetails"
//               value={formData.addressDetails}
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
//               Citizenship ID
//             </label>
//             <input
//               type="text"
//               name="citizenshipId"
//               value={formData.citizenshipId}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Photo Link
//             </label>
//             <input
//               type="url"
//               name="photoLink"
//               value={formData.photoLink}
//               onChange={handleInputChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Location
//             </label>
//             <input
//               type="text"
//               name="location"
//               value={formData.location}
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">
            Sign Up as a Farmer
          </h1>
          <p className="mt-2 text-gray-600">
            Join our blockchain-based agricultural traceability system to showcase your products and connect directly with traders
          </p>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 mb-6 border-l-4 border-emerald-500">
          <h2 className="text-lg font-medium text-emerald-800">Why Register?</h2>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            <li>• Create verifiable records of your farming practices</li>
            <li>• Connect directly with agro traders and gain market visibility</li>
            <li>• Build trust with consumers through transparent product tracking</li>
            <li>• Access fair pricing by eliminating information asymmetry</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your complete legal name as on citizenship"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="addressDetails"
              value={formData.addressDetails}
              onChange={handleInputChange}
              placeholder="Your full residential address (Village/Municipality, District, Province)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="yourname@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
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
              Citizenship ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="citizenshipId"
              value={formData.citizenshipId}
              onChange={handleInputChange}
              placeholder="Your citizenship certificate number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">This information will be securely stored and used for verification purposes only</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Photo Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="photoLink"
              value={formData.photoLink}
              onChange={handleInputChange}
              placeholder="URL to your profile photo (IPFS or cloud storage link)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Please provide a link to your uploaded photo (Consider using services like IPFS, Pinata, or Google Drive)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Farm Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location of your farmland (Village/Municipality, District)"
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
                "Complete Registration"
              )}
            </button>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            By registering, you agree to share your information on the blockchain for supply chain transparency.
            <br />This data will be visible to traders and consumers to verify product authenticity.
          </p>
        </form>
      </div>
    </div>
  );
}