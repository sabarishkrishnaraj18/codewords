import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'card-blue': '#008ee0',
        'card-blue-hover': '#0077c2',
        'card-red': '#ff5241',
        'card-red-hover': '#e03530',
        'card-neutral': '#d4b896',
        'card-neutral-hover': '#c4a882',
        'card-assassin': '#2c2c2c',
        'card-unknown': '#e8dcc8',
        'card-unknown-hover': '#ddd0ba',
        'game-bg': '#1a1a2e',
      },
      fontFamily: {
        display: ['Russo One', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
