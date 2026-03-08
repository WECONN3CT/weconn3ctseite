tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2E3EE8',
                    50: '#F0F4FF',
                    100: '#E8EBFF',
                    200: '#C7CFFF',
                    300: '#A6B3FF',
                    400: '#6A7CFF',
                    500: '#2E3EE8',
                    600: '#2835CF',
                    700: '#1B2470',
                    800: '#141B54',
                    900: '#0D1238',
                    950: '#060918',
                },
                accent: {
                    DEFAULT: '#9D4EDD',
                    50: '#F8F0FF',
                    100: '#F0E0FF',
                    200: '#E0C0FF',
                    300: '#C990FF',
                    400: '#B060FF',
                    500: '#9D4EDD',
                    600: '#7B3DB0',
                    700: '#5A2D82',
                    800: '#3A1D55',
                    900: '#1A0D27',
                }
            },
            animation: {
                'blob': 'blob 7s infinite',
                'shimmer': 'shimmer 1.5s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 60s linear infinite',
                'spin-slow-reverse': 'spin 40s linear infinite reverse',
                'spin-border': 'spin 3s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        }
    }
}
