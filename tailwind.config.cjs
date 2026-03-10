/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#20E090',
                    dark: '#1cbd79',
                    light: '#b6ffdf'
                },
                background: {
                    light: '#F8FAFC',
                    dark: '#0F172A'
                },
                card: {
                    light: '#FFFFFF',
                    dark: '#1E293B'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
