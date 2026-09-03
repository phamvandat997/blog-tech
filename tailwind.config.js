/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./*.html",
    "./assets/js/**/*.js",
    "./content/**/*.md",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          light: '#ffffff',
          'light-subtle': '#f8fafc',
          dark: '#1e293b',        /* Slate-800: Sáng sủa, tương phản tốt hơn nền */
          'dark-card': '#1a2333',   /* Slate-850: Dịu mắt, phân lớp cao cấp */
          'dark-subtle': '#0f172a', /* Slate-900: Sáng hơn nhiều so với nền đen cũ */
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        'glass-dark': '0 8px 24px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.15)',
        'glow-primary': '0 0 20px -3px rgba(99, 102, 241, 0.35)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
