/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A5D8E6',
          light: '#E5F4F9',
          dark: '#7EBFD3',
        },
        secondary: {
          DEFAULT: '#4A90A8',
          light: '#6BA5BA',
          dark: '#357A91',
        },
        accent: {
          DEFAULT: '#D4AF37',
          light: '#E6C967',
          dark: '#B39022',
        },
        success: '#48BB78',
        warning: '#F6AD55',
        error: '#F56565',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      }
    },
  },
  plugins: [],
}