/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1720px",
      "4xl": "1920px",
    },
    colors: {
      primary: "#8383F0",
      bgColor: "#14141F",
      modalBgColor: "#141427",
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      gray: {
        100: "#36393D",
        200: "#e5e7eb",
        600: "#4b5563",
        900: "#18181b",
      },
      red: {
        400: "#f87171",
        500: "#ef4444",
      },
      blue: {
        500: "#3b82f6",
        600: "#2563eb",
      },
      green: {
        500: "#22c55e",
      },
      hinkal: {
        white: {
          100: "#C4C7D7",
          200: "#DEE1F1",
          300: "#ABAEBE",
          400: "#EEEEFF",
        },
        cream: {
          100: "#FFF8DA",
          200: "#F3E8B7",
          300: "#F2DCB3",
        },
        lavender: {
          100: "#B8B8FF",
          200: "#8383F0",
        },
        blue: {
          100: "#090922",
          200: "#1A1A2D",
          300: "#141427",
          400: "#14141F",
          900: "#2C2F3F",
        },
        gray: {
          100: "#9194A4",
          200: "#787B8B",
          300: "#5F6272",
          400: "#6B6B75",
        },
        black: {
          100: "#0D0D12AD",
        },
        red: {
          100: "#ED4030",
        },
        yellow: {
          100: "#F5AA29",
        },
        green: {
          100: "#409B3F",
          200: "#59D258",
        },
        purple: {
          100: "#B8B8FF",
          200: "#9595FF",
        },
        orange: {
          100: "#FA7319",
        },
      },
    },
    extend: {
      boxShadow: {
        metamask: "0 64px 64px -48px rgba(31, 47, 70, 0.12)",
        cream: "0px -8px 14px #CCAC71 inset",
        primary: "0 -5px 8px 1px #9194A4 inset",
        secondary:
          "0 0 15px 0 rgba(0, 0, 0, 0.03), 0 2px 30px 0 rgba(0, 0, 0, 0.08), 0 0 1px 0 rgba(0, 0, 0, 0.30)",
        soft: "0 3px 3px -1.5px rgba(23, 23, 23, 0.06), 0 1px 1px -0.5px rgba(23, 23, 23, 0.06), 0 0 0 1px rgba(23, 23, 23, 0.02)",
        creamInset: "0 -4px 18px 0 rgba(242, 220, 179, 0.10) inset",
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(180deg, #090922 0%, #170438 100%)",
        "gradient-radial": "linear-gradient(180deg, #101014 0%, #121230 100%)",
        "gradient-linear":
          "linear-gradient(88deg, rgba(16, 16, 20, 0.75) 11.33%, rgba(16, 16, 20, 0.50) 88.67%)",
        "gradient-cream": "linear-gradient(180deg, #FFF8DA 0%, #F3E8B7 100%)",
        "gradient-blue": "linear-gradient(180deg, #292941 0%, #14152C 100%)",
        "gradient-blur": "linear-gradient(to right, #101014BF, #10101480)",
        "gradient-lavender":
          "linear-gradient(180deg, #B8B8FF 0%, #8383F0 100%)",
        "gradient-dark": "linear-gradient(180deg, #292941 0%, #14152C 100%)",
        "dots-pattern":
          "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        dots: "24px 24px",
      },
      fontFamily: {
        pubsans: "Public Sans",
        libFranklin: "Libre Franklin",
        inter: ["Inter", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        generalSans: ["GeneralSans", "sans-serif"],
        bricolageGrotesque: ["BricolageGrotesque", "sans-serif"],
      },
    },
  },
  plugins: [],
};
