import React from 'react';

export const FormInput = ({ label, name, type = "text", value, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 placeholder-gray-400 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
      />
    </div>
  );
};

export const SubmitButton = ({ children }) => {
  return (
    <button
      type="submit"
      className="w-full bg-primary-btn-gradient text-white py-2 px-4 rounded-md hover:from-emerald-700 hover:to-teal-600 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
    >
      {children}
    </button>
  );
};

export const FormContainer = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-section-gradient-light-bottom py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden mt-15">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};