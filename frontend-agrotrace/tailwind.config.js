/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can add custom colors here if needed
      },
      backgroundImage: {
        'page-gradient-light': 'linear-gradient(to right, #ecfdf5, #f0fdfa)', // from-emerald-50 to-teal-50
        'section-gradient-light-bottom': 'linear-gradient(to bottom, #ecfdf5, #f0fdfa)', // from-emerald-50 to-teal-50
        'primary-btn-gradient': 'linear-gradient(to right, #059669, #0d9488)', // from-emerald-600 to-teal-600
        'primary-text-gradient': 'linear-gradient(to right, #059669, #0d9488)', // from-emerald-600 to-teal-600
        'accent-gradient-light': 'linear-gradient(to right, #d1fae5, #ccfbf1)', // from-emerald-100 to-teal-100
        'profile-top-gradient': 'linear-gradient(to right, #10b981, #14b8a6)', // from-emerald-500 to-teal-500
        'profile-circle-gradient': 'linear-gradient(to bottom right, #34d399, #14b8a6)', // from-emerald-400 to-teal-500
        'sidebar-active-indicator': 'linear-gradient(to bottom, #10b981, #14b8a6)', // from-emerald-500 to-teal-500
        'section-gradient-light-reverse-bottom': 'linear-gradient(to bottom, #f0fdfa, #ecfdf5)', // from-teal-50 to-emerald-50
        'hero-gradient': 'linear-gradient(to right, #059669, #0d9488)', // for hero section buttons
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
    colors: {
      emerald: {
        50: '#ecfdf5',
        100: '#d1fae5',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#04785e',
        800: '#065f46',
        900: '#064e3b',
      },
      teal: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        500: '#14b8a6',
        600: '#0d9488',
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      white: '#ffffff',
      black: '#000000',
      red: {
        50: '#fef2f2',
        200: '#fecaca',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
      },
      yellow: {
        100: '#fef9c3',
        800: '#92400e',
      },
      blue: {
        500: '#3b82f6',
      },
      transparent: 'transparent',
      current: 'currentColor',
    },
  },
  plugins: [],
} 