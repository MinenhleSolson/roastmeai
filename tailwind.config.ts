// tailwind.config.ts
const { fontFamily } = require('tailwindcss/defaultTheme'); // Import default theme

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Keep if using both routers
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Set Raleway as the default sans-serif font
        sans: ['var(--font-raleway)', ...fontFamily.sans],
        raleway: [
            'Raleway',
            'sans-serif'
        ]  
      },
      // You can also extend other theme properties here
      // colors: { ... }
    },
  },
  plugins: [],
};