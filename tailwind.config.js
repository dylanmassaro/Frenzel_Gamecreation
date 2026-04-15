/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette from the design deck
        cream: "#FDF6E3",
        espresso: "#3E2C23",
        caramel: "#C28A4A",
        golden: "#E6B655",
        sage: "#8AA380",
        berry: "#A24A5F",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
