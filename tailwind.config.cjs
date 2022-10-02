/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "text-green-900",
    "text-red-900",
    "bg-green-100",
    "bg-red-100",
    "border-green-500",
    "border-red-500",
    "todoOpen",
    "todoDone",
  ],
  theme: {
    extend: {
      colors: {
        todoOpen: "rgba(55, 65, 81, 1)",
        todoDone: "rgba(55, 65, 81, 0.2)",
      },
    },
  },
  plugins: [],
};
