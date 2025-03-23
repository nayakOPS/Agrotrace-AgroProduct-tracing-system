import React, { useState } from "react";
// import Navbar from "../components/NavBar";
import Footer from "../components/Footer"; // Assuming you have a Footer component

const FarmerAddCrop = () => {
  const [formData, setFormData] = useState({
    cropName: "",
    area: "",
    location: "",
    plantingDate: "",
    harvestingDate: "",
    pesticideUsed: "",
    organicLabel: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Crop Data:", formData);
    // Call blockchain smart contract function here
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Add Crop Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="cropName" placeholder="Crop Name" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="text" name="area" placeholder="Area of Cultivation (hectares)" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="text" name="location" placeholder="Location" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="date" name="plantingDate" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="date" name="harvestingDate" onChange={handleChange} required className="w-full p-2 border rounded"/>
          <input type="text" name="pesticideUsed" placeholder="Pesticides Used" onChange={handleChange} className="w-full p-2 border rounded"/>
          <select name="organicLabel" onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Label</option>
            <option value="Organic">Organic</option>
            <option value="Certified Seed">Certified Seed</option>
            <option value="Non-Organic">Non-Organic</option>
          </select>
          <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded">Submit</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default FarmerAddCrop;
