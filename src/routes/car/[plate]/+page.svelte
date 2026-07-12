<script lang="ts">
	import Plate from '$lib/components/Plate.svelte';
	import StarIcon from '$lib/components/StarIcon.svelte';
	import VehicleDetail from '$lib/components/VehicleDetail.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
	const v = $derived(data.vehicle);

	let copied = $state(false);
	let isFavourite = $state(data.isFavourite);
	let label = $state(data.label);

	async function toggleFav() {
		isFavourite = !isFavourite;
		const res = await fetch('/api/favourite', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ plate: v.plate })
		});
		if (!res.ok) isFavourite = !isFavourite;
	}

	async function saveLabel() {
		await fetch('/api/label', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ plate: v.plate, label })
		});
	}

	function copyLink() {
		const url = `${window.location.origin}/s/${v.plate}`;
		navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	const cachedDate = $derived(
		new Date(data.cachedAt).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' })
	);
</script>

<svelte:head>
	<title>{v.plate} – {v.make} {v.model} | JSZP</title>
</svelte:head>

<div class="min-h-dvh bg-slate-50">
	<header
		class="sticky top-0 z-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 py-3"
	>
		<a
			href={resolve('/')}
			class="flex items-center gap-1.5 text-sky-700 font-medium text-sm min-h-11 hover:underline"
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg
			>
			Keresés
		</a>
		<div class="flex items-center gap-3">
			{#if data.fromCache}
				<span class="text-xs text-slate-400 hidden sm:inline">{cachedDate}</span>
				<a
					href={resolve(`/car/${v.plate}?refresh=1`)}
					class="text-xs font-medium text-sky-700 hover:underline">Frissítés</a
				>
			{/if}
			<button
				onclick={copyLink}
				aria-label="Link másolása"
				class="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-400 rounded-md px-3 py-2 text-sm min-h-[36px] transition-colors cursor-pointer"
			>
				{#if copied}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg
					>
					Másolva
				{:else}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						><rect x="9" y="9" width="13" height="13" rx="2" /><path
							d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
						/></svg
					>
					Másolás
				{/if}
			</button>
		</div>
	</header>

	<div class="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
		<div class="flex justify-center">
			<div class="relative inline-flex">
				<Plate value={v.plate} />
				<button
					onclick={toggleFav}
					aria-label={isFavourite ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
					class="absolute top-1/2 -translate-y-1/2 -left-10 transition-colors cursor-pointer"
					class:text-amber-400={isFavourite}
					class:text-slate-300={!isFavourite}
				>
					<StarIcon filled={isFavourite} size={28} />
				</button>
			</div>
		</div>

		<VehicleDetail vehicle={v} cachedPhotoUuids={data.cachedPhotoUuids} />

		<div class="flex flex-col gap-1.5">
			<label for="vehicle-label" class="text-xs font-bold uppercase tracking-widest text-slate-400"
				>Megjegyzés</label
			>
			<input
				id="vehicle-label"
				type="text"
				placeholder="Pl. Pajkos"
				maxlength="60"
				bind:value={label}
				onblur={saveLabel}
				class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-colors"
			/>
		</div>
	</div>
</div>
