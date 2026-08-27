<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import AppVersionFooter from '$lib/components/AppVersionFooter.svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Ismeretlen hiba történt.');

	const title = $derived(
		status === 404
			? 'Rendszám nem található'
			: status === 429
				? 'Túl sok lekérdezés'
				: 'Lekérdezési hiba'
	);
</script>

<svelte:head>
	<title>{title} | JSZP</title>
</svelte:head>

<div class="min-h-dvh flex flex-col items-center justify-center bg-slate-50 px-4 gap-6">
	<div
		class="w-full max-w-md bg-white border border-slate-200 rounded-2xl px-8 py-10 shadow-sm text-center"
	>
		<div class="text-4xl font-extrabold text-slate-200 mb-4">{status}</div>
		<h1 class="text-xl font-bold text-slate-900 mb-2">{title}</h1>
		<p class="text-sm text-slate-500 mb-8">{message}</p>
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg px-5 py-3 transition-colors"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg
			>
			Vissza a keresőhöz
		</a>
	</div>

	<AppVersionFooter />
</div>
