import React, { useState } from "react";
// import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const AgroTraderAddProduct = () => {
  const [formData, setFormData] = useState({
    supplier: "",
    batchId: "",
    purchaseDate: "",
    storageConditions: "",
    processingDetails: "",
    certification: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Product Data:", formData);
    // Call blockchain smart contract function here
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Add Agro Product Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="supplier" placeholder="Supplier Name" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="text" name="batchId" placeholder="Batch ID" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="date" name="purchaseDate" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="text" name="storageConditions" placeholder="Storage Conditions" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="text" name="processingDetails" placeholder="Processing Details" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="text" name="certification" placeholder="Certification (Optional)" onChange={handleChange} className="w-full p-2 border rounded"/>
          <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded">Submit</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AgroTraderAddProduct;
