import React from 'react';
import { motion } from 'framer-motion';

const ContactUs = () => {
  const contactMethods = [
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Us",
      detail: "contact@agrotrace.com",
      action: "mailto:contact@agrotrace.com"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Call Us",
      detail: "+977 123 456 789",
      action: "tel:+977123456789"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Visit Us",
      detail: "Kathmandu, Nepal",
      action: "https://maps.google.com"
    }
  ];

  return (
    <section className="min-h-screen px-4 bg-gradient-to-b from-teal-50 to-emerald-50 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">Contact Our Team</h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 md:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-semibold text-emerald-700 mb-6">Contact Information</h3>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={index}
                    href={method.action}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {method.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">{method.title}</h4>
                      <p className="text-gray-600">{method.detail}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">Office Hours</h3>
              <div className="space-y-4">
                {[
                  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
                  { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
                  { day: "Sunday", hours: "Closed" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium text-gray-700">{item.day}</span>
                    <span className="text-gray-600">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;