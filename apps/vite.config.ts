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
			minify: 'esbuild',
			target: 'es2020',
			assetsInlineLimit: 4096,
			modulePreload: {
				polyfill: false
			},
			esbuild: {
				drop: ['console', 'debugger']
			},
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						// Only split node_modules to avoid circular dependencies
						if (id.includes('node_modules')) {
							// Datadog RUM - keep separate for monitoring
							if (id.includes('@datadog')) {
								return 'datadog';
							}
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
