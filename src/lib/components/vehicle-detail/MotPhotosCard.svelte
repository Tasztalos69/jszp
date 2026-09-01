<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { ParsedVehicle } from '$lib/parse.js';

	let {
		vehicle: v,
		cachedPhotoUuids = [],
		allowPhotos = true
	}: { vehicle: ParsedVehicle; cachedPhotoUuids?: string[]; allowPhotos?: boolean } = $props();

	type PhotoState = 'loading' | 'error' | { alt: string; src: string }[];
	let photoState = $state<Record<string, PhotoState>>({});
	let selectedPhoto = $state<{ src: string; alt: string } | null>(null);
	let dialogEl = $state<HTMLDivElement>();

	function closePhoto() {
		selectedPhoto = null;
	}

	$effect(() => {
		if (selectedPhoto) dialogEl?.focus();
	});

	async function loadPhotos(uuid: string) {
		photoState[uuid] = 'loading';
		try {
			const res = await fetch(`/api/mot-photos/${uuid}`);
			if (!res.ok) {
				photoState[uuid] = 'error';
				return;
			}
			photoState[uuid] = await res.json();
		} catch {
			photoState[uuid] = 'error';
		}
	}

	$effect(() => {
		for (const uuid of cachedPhotoUuids) {
			if (!photoState[uuid]) loadPhotos(uuid);
		}
	});
</script>

{#if v.motGalleries?.length > 0}
	<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
		<h2
			class="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-3 border-b border-slate-200"
		>
			Vizsgálati fotók
		</h2>
		<div class="divide-y divide-slate-100">
			{#each v.motGalleries as gallery (gallery.uuid)}
				{@const state = photoState[gallery.uuid]}
				<div class="px-4 py-3">
					<div class="flex items-center justify-between gap-2">
						<span class="text-sm text-slate-500">{gallery.date}</span>
						{#if state === undefined}
							{#if allowPhotos}
								<button
									onclick={() => loadPhotos(gallery.uuid)}
									class="text-xs font-medium text-sky-700 hover:underline cursor-pointer"
									>Fotók betöltése</button
								>
							{/if}
						{:else if state === 'loading'}
							<span class="text-xs text-slate-400">Betöltés…</span>
						{:else if state === 'error'}
							<span class="text-xs text-red-500">Sikertelen</span>
						{:else if state.length === 0}
							<span class="text-xs text-slate-400">Nincs fotó</span>
						{:else}
							<span class="text-xs text-slate-400">{state.length} fotó</span>
						{/if}
					</div>
					{#if Array.isArray(state) && state.length > 0}
						<div class="flex gap-2 overflow-x-auto pt-2 pb-1 -mx-4 px-4">
							{#each state as img, i (i)}
								<button
									onclick={() => (selectedPhoto = img)}
									class="shrink-0 cursor-pointer active:scale-95 transition-transform duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
									aria-label="Fotó megnyitása"
								>
									<img src={img.src} alt={img.alt} class="h-36 w-auto rounded-lg object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<svelte:window onkeydown={(e) => selectedPhoto && e.key === 'Escape' && closePhoto()} />

{#if selectedPhoto}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		bind:this={dialogEl}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 overscroll-contain"
		onclick={(e) => e.target === e.currentTarget && closePhoto()}
		transition:fade={{ duration: 200 }}
	>
		<img
			src={selectedPhoto.src}
			alt={selectedPhoto.alt}
			class="max-h-[90dvh] max-w-[calc(100vw-2rem)] object-contain rounded-lg shadow-2xl"
		/>
		<button
			onclick={closePhoto}
			aria-label="Bezárás"
			class="absolute right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
			style="top: max(1rem, env(safe-area-inset-top, 1rem))"
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
			>
		</button>
	</div>
{/if}
