import React, { useState } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { productTraceabilityContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function AddCrop() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const account = useActiveAccount();
  
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    qualityGrade: "Premium", // Default value
    harvestDate: "",
    farmLocation: "",
    basePricePerKg: "",
    certificationNumber: ""
  });

  const idCounter = useRef(0);
  
  const getSequentialId = () => {
    idCounter.current += 1;
    const newid = `id-${idCounter.current}`
    return newid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert string inputs to required types
    const harvestTimestamp = Math.floor(new Date(formData.harvestDate).getTime() / 1000);
    
    const transaction = prepareContractCall({
      contract:productTraceabilityContract,
      method: "function addCropBatch(string _productName, uint256 _quantity, string _qualityGrade, uint256 _harvestDate, string _farmLocation, uint256 _basePricePerKg, string _certificationNumber)",
      params: [
        formData.productName,
        BigInt(formData.quantity),
        formData.qualityGrade,
        BigInt(harvestTimestamp),
        formData.farmLocation,
        BigInt(formData.basePricePerKg * 100), // Store price in paisa (Rs * 100)
        formData.certificationNumber
      ]
    });

    sendTransaction(transaction, {
      onSuccess: () => {
        alert("Crop batch added successfully!");
        navigate("/farmer-dashboard");
      },
      onError: (error) => {
        console.error("Error adding crop batch:", error);
        alert("Failed to add crop batch. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Add New Crop Batch
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity (kg)
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Quality Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quality Grade
            </label>
            <select
              name="qualityGrade"
              value={formData.qualityGrade}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="Premium">Premium</option>
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          {/* Harvest Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Harvest Date
            </label>
            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Farm Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Farm Location
            </label>
            <input
              type="text"
              name="farmLocation"
              value={formData.farmLocation}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Base Price (Rs/kg)
            </label>
            <input
              type="number"
              name="basePricePerKg"
              min="0"
              step="0.01"
              value={formData.basePricePerKg}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Certification Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certification Number
            </label>
            <input
              type="text"
              name="certificationNumber"
              value={getSequentialId()}
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
              {isPending ? "Submitting..." : "Add Crop Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}