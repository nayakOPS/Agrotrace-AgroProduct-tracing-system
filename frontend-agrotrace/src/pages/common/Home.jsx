import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';

const Home = () => {
  // Create refs for the sections we want to scroll to
  const featuresRef = useRef(null);
  const contactRef = useRef(null);

  // Scroll to features section
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Scroll to contact section
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const HeroSection = () => {
    return (
      <div 
        className="relative min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Dark overlay to improve text readability */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Revolutionizing Agriculture with Blockchain
            </h1>
            <p className="text-xl text-white opacity-90 mb-10 max-w-3xl mx-auto">
              Transparent, traceable, and trustworthy agricultural supply chains powered by blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToFeatures}
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Learn More
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToContact}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const FeatureCard = ({ icon, title, description }) => {
    return (
      <motion.div
        whileHover={{ y: -10 }}
        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-emerald-800 mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </motion.div>
    );
  };

  const FeaturesSection = () => {
    return (
      <section ref={featuresRef} className="py-20 px-4 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-4">Why Choose AgroChain?</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides unique benefits for every participant in the agricultural supply chain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔍"
              title="Transparency"
              description="Every product's journey is recorded on the blockchain for complete visibility."
            />
            <FeatureCard
              icon="🔒"
              title="Security"
              description="Immutable records prevent fraud and ensure data integrity."
            />
            <FeatureCard
              icon="🤝"
              title="Fairness"
              description="Farmers receive fair compensation while consumers get quality assurance."
            />
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <AboutUs />
      <div ref={contactRef} className="scroll-mt-16">
        <ContactUs />
      </div>
    </div>
  );
};

export default Home;