const defaultTheme = require('tailwindcss/defaultTheme')

export default {
    darkMode: 'selector',
    content: [],
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            borderWidth: {
                '1': '1px'
            },
            backgroundColor: {
                'off-white': '#f1f1f1'
            }
        },
        screens: {
            'xs': '475px',
            ...defaultTheme.screens,
        },
    },
    plugins: [],
}

