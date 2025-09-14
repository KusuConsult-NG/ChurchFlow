module.exports = {
  content: ["./pages/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ecwa: { 900:"#0C2C5C", 800:"#0E3E86", 700:"#0E4DA4", 600:"#1363CE", 100:"#EAF2FF" }
      },
      borderRadius: { '2xl': '1.25rem' }
    }
  },
  plugins: []
}
