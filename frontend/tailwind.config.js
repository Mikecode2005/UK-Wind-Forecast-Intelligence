/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: "#0f172a",
          950: "#020617",
        },
        energy: {
          blue: "#0ea5e9",
          amber: "#f59e0b",
          green: "#10b981",
          red: "#ef4444",
        },
      },
    },
  },
  plugins: [],
}

