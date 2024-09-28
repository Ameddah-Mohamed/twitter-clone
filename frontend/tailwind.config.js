import daisyui from "daisyui";
import daisyUIThemes from "daisyui/src/theming/themes";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
		"custom-blue": "rgb(18, 144, 230)",
		"hoverBlue": "rgb(62, 166, 237)",
		"activeBlue": "rgb(89, 171, 227)" // Optional: Add more variations
      },
    },
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",
      {
        black: {
          ...daisyUIThemes["black"],
          primary: "rgb(29, 155, 240)", // Existing color
          secondary: "rgb(24, 24, 24)", // Existing color
          // Optionally, you can add custom DaisyUI theme colors here
          // primary: "var(--custom-blue)", // Example of using custom color in DaisyUI theme
        },
      },
    ],
  },
};
