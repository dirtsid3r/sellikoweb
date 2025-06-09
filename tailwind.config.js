/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/preline/preline.js',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			sm: '1.5rem',
  			lg: '2rem',
  			xl: '3rem',
  			'2xl': '4rem'
  		},
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		screens: {
  			xs: '320px',
  			sm: '375px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1536px',
  			mobile: '480px',
  			tablet: '640px',
  			laptop: '1024px',
  			desktop: '1280px',
  			touch: {
  				raw: '(hover: none)'
  			},
  			'no-touch': {
  				raw: '(hover: hover)'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Plus Jakarta Sans',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'SF Mono',
  				'Monaco',
  				'Inconsolata',
  				'Roboto Mono',
  				'monospace'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': '#E6F3FF',
  				'100': '#CCE7FF',
  				'200': '#99CFFF',
  				'300': '#66B7FF',
  				'400': '#339FFF',
  				'500': '#007AFF',
  				'600': '#0056CC',
  				'700': '#004199',
  				'800': '#002D66',
  				'900': '#001833',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#F0F0FD',
  				'100': '#E1E0FB',
  				'200': '#C3C1F7',
  				'300': '#A5A2F3',
  				'400': '#8783EF',
  				'500': '#5856D6',
  				'600': '#4644AB',
  				'700': '#353380',
  				'800': '#232255',
  				'900': '#12112B',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			success: {
  				'50': '#E8F5E8',
  				'100': '#D1EBD1',
  				'200': '#A3D7A3',
  				'300': '#75C375',
  				'400': '#47AF47',
  				'500': '#34C759',
  				'600': '#2A9F47',
  				'700': '#1F7735',
  				'800': '#154F23',
  				'900': '#0A2711',
  				DEFAULT: '#34C759',
  				foreground: '#FFFFFF'
  			},
  			warning: {
  				'50': '#FFF4E6',
  				'100': '#FFE9CC',
  				'200': '#FFD399',
  				'300': '#FFBD66',
  				'400': '#FFA733',
  				'500': '#FF9500',
  				'600': '#CC7700',
  				'700': '#995900',
  				'800': '#663B00',
  				'900': '#331D00',
  				DEFAULT: '#FF9500',
  				foreground: '#FFFFFF'
  			},
  			destructive: {
  				'50': '#FFE8E6',
  				'100': '#FFD1CC',
  				'200': '#FFA399',
  				'300': '#FF7566',
  				'400': '#FF4733',
  				'500': '#FF3B30',
  				'600': '#CC2F26',
  				'700': '#99231D',
  				'800': '#661713',
  				'900': '#330B0A',
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			gray: {
  				'50': '#F2F2F7',
  				'100': '#E5E5EA',
  				'200': '#D1D1D6',
  				'300': '#C7C7CC',
  				'400': '#AEAEB2',
  				'500': '#8E8E93',
  				'600': '#636366',
  				'700': '#48484A',
  				'800': '#3A3A3C',
  				'900': '#1C1C1E'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		spacing: {
  			'11': '2.75rem',
  			'13': '3.25rem',
  			'15': '3.75rem',
  			'18': '4.5rem',
  			'22': '5.5rem',
  			'26': '6.5rem',
  			'30': '7.5rem',
  			'0.5': '0.125rem',
  			'1.5': '0.375rem',
  			'2.5': '0.625rem',
  			'3.5': '0.875rem',
  			'4.5': '1.125rem',
  			'5.5': '1.375rem',
  			'6.5': '1.625rem',
  			'7.5': '1.875rem',
  			'8.5': '2.125rem',
  			'9.5': '2.375rem'
  		},
  		minHeight: {
  			touch: '44px',
  			button: '48px',
  			input: '52px'
  		},
  		minWidth: {
  			touch: '44px',
  			button: '88px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xs: '0.25rem',
  			xl: '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem'
  		},
  		boxShadow: {
  			mobile: '0 2px 8px rgba(0, 0, 0, 0.1)',
  			'mobile-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
  			ios: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  			'ios-lg': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'slide-in-up': {
  				'0%': {
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-down': {
  				'0%': {
  					transform: 'translateY(-100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			shimmer: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-in-up': 'slide-in-up 0.3s ease-out',
  			'slide-in-down': 'slide-in-down 0.3s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'scale-in': 'scale-in 0.2s ease-out',
  			shimmer: 'shimmer 2s linear infinite'
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		zIndex: {
  			'1': '1',
  			'10': '10',
  			'20': '20',
  			'30': '30',
  			'40': '40',
  			'50': '50',
  			dropdown: '1000',
  			sticky: '1020',
  			fixed: '1030',
  			'modal-backdrop': '1040',
  			modal: '1050',
  			popover: '1060',
  			tooltip: '1070',
  			toast: '1080'
  		}
  	}
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('preline/plugin'),
  ],
}

module.exports = config 