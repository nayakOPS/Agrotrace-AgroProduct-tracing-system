const ContactUs = () => {
    return (
      <section className="min-h-screen px-4 bg-gradient-to-b from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full py-16">
          <h2 className="text-4xl font-bold text-center text-emerald-800 mb-8">Contact Us</h2>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-emerald-700">Get in Touch</h3>
                <p className="text-gray-600">
                  Have questions about AgroChain? We're here to help! Reach out to us 
                  through any of the following channels:
                </p>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-6 h-6 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>contact@agrochain.com</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-6 h-6 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+977 123 456 789</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-6 h-6 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Kathmandu, Nepal</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-emerald-800 mb-4">Office Hours</h3>
                <div className="space-y-2 text-gray-700">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  export default ContactUs;