import FarmerSidebar from './FarmerSidebar';

const FarmerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50">
      <FarmerSidebar />
      <div className="ml-64 p-8">
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FarmerLayout; 