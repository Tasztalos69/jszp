import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		SvelteKitPWA({
			manifest: false, // we ship our own static/manifest.webmanifest
			strategies: 'generateSW',
			workbox: {
				navigateFallback: '/',
				globPatterns: ['client/**/*.{js,css,html,svg,png,webp,woff2}'],
				runtimeCaching: [
					{
						// Network-only for API — always fetch fresh gov data
						urlPattern: /\/api\//,
						handler: 'NetworkOnly'
					}
				]
			}
		})
	]
});
