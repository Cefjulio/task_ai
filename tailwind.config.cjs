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
                    DEFAULT: '#1CB0F6',
                    dark: '#0099DD',
                    light: '#C5EAFF'
                },
                background: {
                    light: '#F0F4F8',
                    dark: '#0D1117'
                },
                card: {
                    light: '#FFFFFF',
                    dark: '#161B22'
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
