<script lang="ts">
	import { goto, beforeNavigate, afterNavigate } from '$app/navigation';
	import PlateInput from '$lib/components/PlateInput.svelte';
	import type { PageData } from './$types.js';
	import { resolve } from '$app/paths';

	type ServerStatus = 'initializing' | 'alive' | 'broken';

	let { data }: { data: PageData } = $props();

	let plate = $state('');
	let error = $state('');
	let loading = $state(false);
	let serverStatus = $state<ServerStatus>('initializing');

	// Use navigate hooks — more reliable than the navigating rune
	beforeNavigate(() => {
		loading = true;
	});
	afterNavigate(() => {
		loading = false;
	});

	$effect(() => {
		const es = new EventSource('/api/status');
		es.onmessage = (e) => {
			serverStatus = e.data as ServerStatus;
		};
		es.onerror = () => {
			serverStatus = 'broken';
		};
		return () => es.close();
	});

	function handleInput(e: Event) {
		plate = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const val = plate.trim();
		if (!val) {
			error = 'Adjon meg egy rendszámot.';
			return;
		}
		if (!/^[A-Z0-9]{6,7}$/.test(val)) {
			error = 'Érvénytelen rendszám (6–7 karakter, betűk és számok).';
			return;
		}
		error = '';
		goto(resolve(`/car/${val}`));
	}

	const statusMeta: Record<ServerStatus, { label: string; dot: string }> = {
		initializing: { label: 'KAÜ Bejelentkezés…', dot: 'bg-amber-400' },
		alive: { label: 'JSZP kapcsolat aktív', dot: 'bg-green-500' },
		broken: { label: 'Kapcsolat sikertelen', dot: 'bg-red-500' }
	};
</script>

<svelte:head>
	<title>JSZP Lekérdező</title>
</svelte:head>

{#if loading}
	<div
		class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-50/90 backdrop-blur-sm"
	>
		<div
			class="size-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"
		></div>
		<div class="text-center">
			<p class="font-semibold text-slate-800 text-lg">
				{serverStatus === 'initializing' ? 'Bejelentkezés folyamatban…' : 'Lekérdezés folyamatban…'}
			</p>
			<p class="text-slate-500 text-sm mt-1">Ez 30–60 másodpercet vehet igénybe</p>
		</div>
	</div>
{/if}

<div class="min-h-dvh flex flex-col items-center justify-center bg-slate-50 px-4 gap-4 py-8">
	<main class="w-full max-w-md bg-white border border-slate-200 rounded-2xl px-8 py-10 shadow-sm">
		<h1 class="text-3xl font-extrabold text-slate-900 text-center tracking-tight mb-1">JSZP</h1>
		<p class="text-sm text-slate-500 text-center mb-8">Járműadatok lekérdezése</p>

		<form onsubmit={handleSubmit} novalidate class="flex flex-col gap-3">
			<PlateInput value={plate} oninput={handleInput} />

			{#if error}
				<p id="plate-error" class="text-red-600 text-sm -mt-1" role="alert">
					{error}
				</p>
			{/if}

			<button
				type="submit"
				class="flex items-center justify-center gap-2 w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer"
			>
				Lekérdezés
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg
				>
			</button>
		</form>
	</main>

	<!-- Status card -->
	<div
		class="w-full max-w-md bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex items-center justify-between gap-4"
	>
		<div class="flex items-center gap-2.5">
			<span class="size-2.5 rounded-full shrink-0 {statusMeta[serverStatus].dot}" aria-hidden="true"
			></span>
			<span class="text-sm text-slate-600">{statusMeta[serverStatus].label}</span>
		</div>
		{#if data.username}
			<span class="text-xs text-slate-400 font-mono truncate">{data.username}</span>
		{/if}
	</div>
</div>
