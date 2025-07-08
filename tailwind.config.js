module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        efefef: "#EFEFEF",
        under: "#868686",
        "light-border": "#ACACAC",
        "darker-green": "#3CB64C",
        "light-green": "#00BA13",
        "lighter-green": "#C4FFCA",
        "red": "#FF0000",
        "button-selected": "#89FF9580",
        "dark-gray": "#4A4A4A"
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        "button:hover": {
          outline: "none",
        },
        "button:focus": {
          outline: "none",
        },
      });
    },
  ],
};
