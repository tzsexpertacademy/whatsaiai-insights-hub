
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			},
			// Utilitários responsivos customizados
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		// Plugin customizado para utilitários responsivos
		function({ addUtilities }: any) {
			const newUtilities = {
				'.text-responsive-xs': {
					fontSize: '0.75rem',
					'@screen sm': {
						fontSize: '0.875rem'
					}
				},
				'.text-responsive-sm': {
					fontSize: '0.875rem',
					'@screen sm': {
						fontSize: '1rem'
					}
				},
				'.text-responsive-base': {
					fontSize: '1rem',
					'@screen sm': {
						fontSize: '1.125rem'
					}
				},
				'.text-responsive-lg': {
					fontSize: '1.125rem',
					'@screen sm': {
						fontSize: '1.25rem'
					},
					'@screen lg': {
						fontSize: '1.5rem'
					}
				},
				'.text-responsive-xl': {
					fontSize: '1.25rem',
					'@screen sm': {
						fontSize: '1.5rem'
					},
					'@screen lg': {
						fontSize: '1.875rem'
					}
				},
				'.text-responsive-2xl': {
					fontSize: '1.5rem',
					'@screen sm': {
						fontSize: '1.875rem'
					},
					'@screen lg': {
						fontSize: '2.25rem'
					}
				},
				'.text-responsive-3xl': {
					fontSize: '1.875rem',
					'@screen sm': {
						fontSize: '2.25rem'
					},
					'@screen lg': {
						fontSize: '3rem'
					}
				},
				'.text-responsive-4xl': {
					fontSize: '2.25rem',
					'@screen sm': {
						fontSize: '3rem'
					},
					'@screen lg': {
						fontSize: '3.75rem'
					}
				},
				'.container-responsive': {
					width: '100%',
					paddingLeft: '1rem',
					paddingRight: '1rem',
					'@screen sm': {
						paddingLeft: '1.5rem',
						paddingRight: '1.5rem'
					},
					'@screen lg': {
						paddingLeft: '2rem',
						paddingRight: '2rem'
					}
				},
				'.no-horizontal-scroll': {
					overflowX: 'hidden',
					width: '100%',
					maxWidth: '100vw'
				}
			}
			addUtilities(newUtilities, ['responsive'])
		}
	],
} satisfies Config;
