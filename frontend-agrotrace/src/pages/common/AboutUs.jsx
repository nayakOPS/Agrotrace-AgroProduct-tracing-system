import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <section className="min-h-screen pt-20 px-4 bg-gradient-to-b from-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">About AgroChain</h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto"></div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-700 leading-relaxed mb-12 text-center max-w-3xl mx-auto"
            >
              AgroChain revolutionizes agricultural supply chains with blockchain technology, 
              ensuring transparency from farm to table. Our platform empowers farmers, 
              traders, and consumers with verifiable product histories.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "For Farmers",
                  icon: "🌱",
                  desc: "Gain fair pricing, build reputation, and connect directly with buyers through our transparent marketplace.",
                  bg: "bg-emerald-50",
                  color: "text-emerald-800"
                },
                {
                  title: "For Traders",
                  icon: "🛒", 
                  desc: "Source quality produce with verified origins, build trust with customers, and streamline your supply chain.",
                  bg: "bg-teal-50",
                  color: "text-teal-800"
                },
                {
                  title: "For Consumers",
                  icon: "👨‍👩‍👧‍👦",
                  desc: "Scan QR codes to view product journeys, support ethical farming, and make informed purchasing decisions.",
                  bg: "bg-emerald-50",
                  color: "text-emerald-800"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`${item.bg} p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow`}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className={`text-xl font-semibold ${item.color} mb-3`}>{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-emerald-800 mb-4">Our Mission</h3>
              <p className="text-gray-700 max-w-3xl mx-auto">
                To create equitable agricultural ecosystems where every stakeholder benefits 
                from transparency, traceability, and trust through blockchain technology.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;