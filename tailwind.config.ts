import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bod: {
          blue:   '#1A4A8A',
          dark:   '#0D2E5A',
          mid:    '#2563B0',
          light:  '#E8F0FA',
          xlight: '#F3F7FD',
          sky:    '#60A5FA',
        },
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
