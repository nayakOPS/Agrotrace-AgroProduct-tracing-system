import React, { useState, useEffect } from "react";
import { useReadContract, useContractEvents } from "thirdweb/react";
import { productTraceabilityContract } from "../../client";
import { useActiveAccount } from "thirdweb/react";
import { readContract } from "thirdweb";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to convert BigInt to Number
const convertBigInt = (value) => {
  return typeof value === 'bigint' ? Number(value) : value;
};

// Chart color palette
const chartColors = {
  primary: '#3B82F6', // blue-500
  secondary: '#8B5CF6', // violet-500
  accent: '#EC4899', // pink-500
  success: '#10B981', // emerald-500
  warning: '#F59E0B', // amber-500
  info: '#06B6D4', // cyan-500
};

export default function Dashboard() {
  const account = useActiveAccount();
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [analytics, setAnalytics] = useState({
    totalBatches: 0,
    totalQuantity: 0,
    totalRevenue: 0,
    productsByType: {},
    productsByGrade: {},
    salesTimeline: [],
    priceTrends: [],
    productDetails: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Get batch counter
  const { data: batchCount } = useReadContract({
    contract: productTraceabilityContract,
    method: "function batchCounter() view returns (uint256)",
  });

  // Fetch all analytics data
  useEffect(() => {
    if (!account?.address || !batchCount) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const batches = [];
        const productTypes = {};
        const qualityGrades = {};
        const productDetails = {};
        let totalQuantity = 0;
        let totalRevenue = 0;
        const salesTimeline = [];
        const priceTrends = [];

        // Fetch all batches in parallel
        const batchPromises = [];
        for (let i = 1; i <= batchCount; i++) {
          batchPromises.push(
            readContract({
              contract: productTraceabilityContract,
              method: "function cropBatches(uint256) view returns (address, string, uint256, string, uint256, string, uint256, string)",
              params: [i],
            }).then(async (cropData) => {
              if (!cropData || !cropData[0]) return null;

              // Only process batches belonging to this farmer
              if (cropData[0].toLowerCase() === account.address.toLowerCase()) {
                const processedData = await readContract({
                  contract: productTraceabilityContract,
                  method: "function processedBatches(uint256) view returns (address, uint256, uint256, string, uint256, string, string)",
                  params: [i],
                });

                const quantity = convertBigInt(cropData[2]);
                const basePrice = convertBigInt(cropData[6]);
                const productName = cropData[1];
                const qualityGrade = cropData[3];
                const harvestDate = convertBigInt(cropData[4]);
                const revenue = (basePrice * quantity) / 100; // Convert from paisa to rupees

                // Update product details
                if (!productDetails[productName]) {
                  productDetails[productName] = {
                    totalQuantity: 0,
                    totalRevenue: 0,
                    batches: 0,
                    qualityGrades: {},
                  };
                }
                productDetails[productName].totalQuantity += quantity;
                productDetails[productName].totalRevenue += revenue;
                productDetails[productName].batches += 1;
                productDetails[productName].qualityGrades[qualityGrade] = 
                  (productDetails[productName].qualityGrades[qualityGrade] || 0) + quantity;

                // Update analytics
                totalQuantity += quantity;
                totalRevenue += revenue;

                // Update product type distribution
                productTypes[productName] = (productTypes[productName] || 0) + quantity;

                // Update quality grade distribution
                qualityGrades[qualityGrade] = (qualityGrades[qualityGrade] || 0) + quantity;

                // Update sales timeline
                salesTimeline.push({
                  date: new Date(harvestDate * 1000),
                  quantity,
                  productName,
                  isProcessed: processedData && processedData[0] !== "0x0000000000000000000000000000000000000000",
                });

                // Update price trends
                priceTrends.push({
                  date: new Date(harvestDate * 1000),
                  price: basePrice / 100, // Convert from paisa to rupees
                  productName,
                });

                return {
                  batchId: i,
                  productName,
                  quantity,
                  qualityGrade,
                  harvestDate,
                  basePrice,
                  isProcessed: processedData && processedData[0] !== "0x0000000000000000000000000000000000000000",
                };
              }
              return null;
            })
          );
        }

        const results = await Promise.all(batchPromises);
        const validBatches = results.filter(batch => batch !== null);

        setAnalytics({
          totalBatches: validBatches.length,
          totalQuantity,
          totalRevenue,
          productsByType: productTypes,
          productsByGrade: qualityGrades,
          salesTimeline: salesTimeline.sort((a, b) => a.date - b.date),
          priceTrends: priceTrends.sort((a, b) => a.date - b.date),
          productDetails,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [account?.address, batchCount]);

  // Filter data based on selected product
  const getFilteredData = () => {
    if (selectedProduct === 'all') {
      return {
        quantity: analytics.totalQuantity || 0,
        revenue: analytics.totalRevenue || 0,
        batches: analytics.totalBatches || 0,
        salesTimeline: analytics.salesTimeline || [],
        priceTrends: analytics.priceTrends || [],
        qualityGrades: analytics.productsByGrade || {},
      };
    }

    const productData = analytics.productDetails[selectedProduct] || {
      totalQuantity: 0,
      totalRevenue: 0,
      batches: 0,
      qualityGrades: {},
    };

    return {
      quantity: productData.totalQuantity || 0,
      revenue: productData.totalRevenue || 0,
      batches: productData.batches || 0,
      qualityGrades: productData.qualityGrades || {},
      salesTimeline: analytics.salesTimeline.filter(item => item.productName === selectedProduct) || [],
      priceTrends: analytics.priceTrends.filter(item => item.productName === selectedProduct) || [],
    };
  };

  const filteredData = getFilteredData();

  // Prepare chart data
  const productTypeData = {
    labels: Object.keys(analytics.productsByType),
    datasets: [{
      data: Object.values(analytics.productsByType),
      backgroundColor: Object.values(chartColors),
    }],
  };

  const qualityGradeData = {
    labels: Object.keys(filteredData.qualityGrades),
    datasets: [{
      label: 'Quantity by Quality Grade',
      data: Object.values(filteredData.qualityGrades),
      backgroundColor: chartColors.primary,
    }],
  };

  const salesTimelineData = {
    labels: filteredData.salesTimeline.map(item => item.date.toLocaleDateString()),
    datasets: [{
      label: 'Sales Quantity',
      data: filteredData.salesTimeline.map(item => item.quantity),
      borderColor: chartColors.secondary,
      tension: 0.1,
    }],
  };

  const priceTrendData = {
    labels: filteredData.priceTrends.map(item => item.date.toLocaleDateString()),
    datasets: [{
      label: 'Price per kg (Rs)',
      data: filteredData.priceTrends.map(item => item.price),
      borderColor: chartColors.accent,
      tension: 0.1,
    }],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-700 mb-8">Farmer Dashboard</h1>

        {/* Product Selection */}
        <div className="mb-8">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Products</option>
            {Object.keys(analytics.productsByType).map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Batches</h3>
            <p className="text-3xl font-bold text-emerald-600">{filteredData.batches || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Quantity</h3>
            <p className="text-3xl font-bold text-emerald-600">{filteredData.quantity || 0} kg</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-emerald-600">Rs. {(filteredData.revenue || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(analytics.productDetails).map(([product, details]) => (
                  <tr key={product}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{details.batches}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{details.totalQuantity} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {details.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Distribution</h3>
            <div className="h-80">
              <Pie data={productTypeData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Quality Grade Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Grade Distribution</h3>
            <div className="h-80">
              <Bar data={qualityGradeData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Sales Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Timeline</h3>
            <div className="h-80">
              <Line data={salesTimelineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Price Trends */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Price Trends</h3>
            <div className="h-80">
              <Line data={priceTrendData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}