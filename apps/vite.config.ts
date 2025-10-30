import contentCollections from '@content-collections/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import utwm from 'unplugin-tailwindcss-mangle/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	const isProduction = mode === 'production';

	return {
		css: {
			devSourcemap: true,
			transformer: 'lightningcss',
			lightningcss: {
				minify: true,
				targets: {
					chrome: 90,
					firefox: 88,
					safari: 14,
					edge: 90
				}
			},
			modules: {
				generateScopedName: isProduction
					? '[hash:base64:5]'
					: '[local]_[hash:base64:5]'
			}
		},
		plugins: [
			tailwindcss(),
			sveltekit(),
			contentCollections(),
			Icons({
				compiler: 'svelte',
				autoInstall: true
			}),
			isProduction ? utwm() : null
		].filter(Boolean),
		build: {
			chunkSizeWarningLimit: 500,
			minify: 'terser',
			target: 'es2020',
			assetsInlineLimit: 4096,
			modulePreload: {
				polyfill: false
			},
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
					pure_funcs: ['console.log', 'console.info', 'console.debug'],
					passes: 2,
					dead_code: true,
					unused: true
				},
				mangle: {
					safari10: true,
					toplevel: true
				},
				format: {
					comments: false,
					ecma: 2020
				}
			},
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						// Only split node_modules to avoid circular dependencies
						if (id.includes('node_modules')) {
							// Heavy markdown processing libraries
							if (id.includes('rehype') || id.includes('remark') || id.includes('unified') || id.includes('katex')) {
								return 'markdown';
							}
							// Icons
							if (id.includes('@iconify') || id.includes('lucide')) {
								return 'icons';
							}
							// Content collections
							if (id.includes('@content-collections')) {
								return 'content';
							}
							// Svelte framework
							if (id.includes('svelte')) {
								return 'svelte';
							}
						}
						// Everything else goes to default chunks
					},
					assetFileNames: (assetInfo) => {
						for (const name of assetInfo.names) {
							if (name.endsWith('.html')) {
								return 'labs/[name][extname]';
							}
						}
						return 'assets/[name]-[hash][extname]';
					},
					chunkFileNames: 'chunks/[name]-[hash].js',
					entryFileNames: 'entries/[name]-[hash].js'
				}
			}
		},
		server: {
			fs: {
				allow: ['static']
			}
		}
	};
});
