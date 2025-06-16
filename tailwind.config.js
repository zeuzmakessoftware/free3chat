/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          pink: {
            700: '#be185d',
          }
        },
        backgroundImage: {
          'radial': 'radial-gradient(var(--tw-gradient-stops))',
          'radial-at-t': 'radial-gradient(at top, var(--tw-gradient-stops))',
          'radial-at-b': 'radial-gradient(at bottom, var(--tw-gradient-stops))',
          'radial-at-l': 'radial-gradient(at left, var(--tw-gradient-stops))',
          'radial-at-r': 'radial-gradient(at right, var(--tw-gradient-stops))',
          'radial-at-tl': 'radial-gradient(at top left, var(--tw-gradient-stops))',
          'radial-at-tr': 'radial-gradient(at top right, var(--tw-gradient-stops))',
          'radial-at-bl': 'radial-gradient(at bottom left, var(--tw-gradient-stops))',
          'radial-at-br': 'radial-gradient(at bottom right, var(--tw-gradient-stops))',
          'radial-at-c': 'radial-gradient(at center, var(--tw-gradient-stops))',
        }
      },
    },
    plugins: [],
  }