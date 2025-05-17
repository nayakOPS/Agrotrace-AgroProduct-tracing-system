import React, { useState } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { productTraceabilityContract } from "../../client";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from 'react-hot-toast';

export default function AddCrop() {
  const navigate = useNavigate();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  // State for form data
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    qualityGrade: "Premium",
    harvestDate: "",
    farmLocation: "",
    basePricePerKg: "",
  });

  // Function to generate certification number
  const generateCertificationNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const prefix = 'CERT';
    return `${prefix}-${timestamp.slice(-6)}-${random}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data
      if (!formData.productName || !formData.quantity || !formData.harvestDate || 
          !formData.farmLocation || !formData.basePricePerKg) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate quantity
      if (formData.quantity <= 0) {
        toast.error("Quantity must be greater than 0");
        return;
      }

      // Validate price
      if (formData.basePricePerKg <= 0) {
        toast.error("Base price must be greater than 0");
        return;
      }

      // Convert harvest date to timestamp
      const harvestTimestamp = Math.floor(new Date(formData.harvestDate).getTime() / 1000);

      // Validate harvest date
      if (harvestTimestamp > Math.floor(Date.now() / 1000)) {
        toast.error("Harvest date cannot be in the future");
        return;
      }

      // Generate certification number
      const certificationNumber = generateCertificationNumber();

      const transaction = prepareContractCall({
        contract: productTraceabilityContract,
        method: "function addCropBatch(string _productName, uint256 _quantity, string _qualityGrade, uint256 _harvestDate, string _farmLocation, uint256 _basePricePerKg, string _certificationNumber)",
        params: [
          formData.productName,
          BigInt(formData.quantity),
          formData.qualityGrade,
          BigInt(harvestTimestamp),
          formData.farmLocation,
          BigInt(Math.round(formData.basePricePerKg * 100)), // Convert to paisa
          certificationNumber
        ]
      });

      // Show loading toast
      const loadingToast = toast.loading("Adding crop batch...");

      sendTransaction(transaction, {
        onSuccess: () => {
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          // Show success toast with certification number
          toast.success(`Crop batch added successfully! Certification Number: ${certificationNumber}`, {
            duration: 6000,
            icon: '🌾',
          });
          // Navigate after a short delay
          setTimeout(() => {
            navigate("/farmer-products");
          }, 2000);
        },
        onError: (error) => {
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          // Show error toast
          toast.error(`Failed to add crop batch: ${error.message}`, {
            duration: 5000,
          });
        }
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Please check your inputs and try again", {
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
          // Success toast style
          success: {
            style: {
              borderLeft: '4px solid #10B981',
            },
          },
          // Error toast style
          error: {
            style: {
              borderLeft: '4px solid #EF4444',
            },
          },
          // Loading toast style
          loading: {
            style: {
              borderLeft: '4px solid #3B82F6',
            },
          },
        }}
      />
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
              min="0"
              step="0.01"
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
              <option value="Grade C">Grade C</option>
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
              max={new Date().toISOString().split('T')[0]}
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

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
            >
              {isPending ? "Adding Crop..." : "Add Crop Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}