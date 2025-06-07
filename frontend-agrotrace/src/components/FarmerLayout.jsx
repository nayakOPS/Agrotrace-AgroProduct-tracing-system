import Sidebar from './Sidebar';
import { useState } from 'react';

const FarmerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-page-gradient-light">
      <Sidebar />
      <div className="ml-64 p-8">
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FarmerLayout; 