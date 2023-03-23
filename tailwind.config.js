const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      primary: '#624BFF',
      bgColor: '#141416',
      modalBgColor: '#202426',
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      gray: {
        200: '#e5e7eb',
        600: '#4b5563',
        900: '#18181b',
      },
      red: {
        400: '#f87171',
        500: '#ef4444',
      },
      blue: {
        500: '#3b82f6',
        600: '#2563eb',
      },
      green: {
        500: '#22c55e',
      },
    },
    extend: {
      fontFamily: {
        pubsans: 'Public Sans',
        libFranklin: 'Libre Franklin',
      },
      boxShadow: {
        metamask: '0 64px 64px -48px rgba(31, 47, 70, 0.12)',
      },
    },
  },
  plugins: [],
};
