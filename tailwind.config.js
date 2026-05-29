/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
      },
      colors: {
        // Traffic-police palette: white dominant, blue accent.
        police: {
          50: '#EEF4FF',
          100: '#DCE7FF',
          200: '#BED2FF',
          300: '#92B2FF',
          400: '#5E86FB',
          500: '#3A63F0',
          600: '#1D4ED8', // primary
          700: '#1A40B0',
          800: '#1B3A8F',
          900: '#1B3370'
        },
        ink: {
          900: '#0B1B3F', // headings (navy)
          700: '#1E2A44',
          500: '#475569', // body text
          400: '#64748B'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F6F8FD', // light blue-tinted background
          muted: '#EEF2FA'
        },
        line: '#E4E9F2'
      },
      boxShadow: {
        soft: '0 4px 20px -6px rgba(15, 40, 100, 0.10)',
        card: '0 10px 30px -12px rgba(15, 40, 100, 0.14)',
        'card-hover': '0 18px 44px -16px rgba(29, 78, 216, 0.22)',
        ring: '0 0 0 4px rgba(29, 78, 216, 0.12)'
      },
      backgroundImage: {
        'blue-fade':
          'linear-gradient(180deg, #F6F8FD 0%, #FFFFFF 100%)'
      },
      animation: {
        'float-slow': 'float 9s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out both'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' }
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
