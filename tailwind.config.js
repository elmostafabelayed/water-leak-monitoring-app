/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0A0E1A',
        },
        guardian: {
          bg: '#0A0E1A',
          card: '#131929',
          accent: '#00BCD4',
          danger: '#FF3B5C',
        },
      },
    },
  },
  plugins: [],
}
