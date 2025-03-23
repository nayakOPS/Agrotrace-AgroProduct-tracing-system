import React from 'react';

const AboutUs = () => {
    return (
      <section className="min-h-screen pt-16 px-4 bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-4xl font-bold text-center text-emerald-800 mb-8">About Us</h2>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              AgroChain is a blockchain-powered platform designed to improve transparency 
              and traceability in the agricultural supply chain. We help farmers and 
              agro-traders register and track their agro products, ensuring authenticity 
              and trust in the market.
            </p>
            <h3 className="text-2xl font-semibold text-emerald-700 mb-6">Problems We Solve</h3>
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-emerald-800 mb-2">For Farmers</h4>
                <p className="text-gray-700">
                  Empowering farmers to track the price and quality of their products 
                  while ensuring transparency in the agricultural marketplace.
                </p>
              </div>
              <div className="bg-teal-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-teal-800 mb-2">For Agro-Traders</h4>
                <p className="text-gray-700">
                  Enabling agro-traders to package and sell agro products with trust 
                  and efficiency, building lasting brand value.
                </p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-emerald-800 mb-2">For Consumers</h4>
                <p className="text-gray-700">
                  Allowing consumers to verify the details of agro products by scanning 
                  QR codes, promoting safe and informed consumption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

export default AboutUs;