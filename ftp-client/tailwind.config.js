const defaultTheme = require('tailwindcss/defaultTheme')

export default {
    content: [],
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            borderWidth: {
                '1': '1px'
            }
        },
        screens: {
            'xs': '475px',
            ...defaultTheme.screens,
        },
    },
    plugins: [],
}

