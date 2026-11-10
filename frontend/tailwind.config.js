/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 底色层次
        'dark-bg': '#09111d',
        'dark-card': '#121e2d',
        'dark-elevated': '#1a2a3b',

        // 主色：青蓝；辅助：低饱和紫
        'cyber-blue': '#55c3e7',
        'cyber-purple': '#a995ed',

        // 语义色（克制使用）
        'cyber-success': '#10b981',
        'cyber-warning': '#f59e0b',
        'cyber-error': '#ef4444',

        // 文本层次
        'text-primary': '#f5f8fb',
        'text-secondary': '#b4c3d2',
        'text-tertiary': '#8ea2b6'
      },
      fontFamily: {
        // 只用系统字体，避免额外网络依赖
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace']
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(0.94)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-up': 'slideUp 0.3s ease-out both',
        'pulse-glow': 'pulseGlow 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
}
