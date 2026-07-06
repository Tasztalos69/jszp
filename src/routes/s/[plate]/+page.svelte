<script lang="ts">
	import Plate from '$lib/components/Plate.svelte';
	import VehicleDetail from '$lib/components/VehicleDetail.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
	const v = $derived(data.vehicle);
</script>

<svelte:head>
	<title>{v.plate} – {v.make} {v.model} | JSZP</title>
</svelte:head>

<div class="min-h-dvh bg-slate-50">
	<div class="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
		{#if data.label}
			<h1 class="text-center text-2xl font-bold text-slate-900 tracking-tight">{data.label}</h1>
		{/if}

		<div class="flex justify-center">
			<Plate value={v.plate} />
		</div>

		<VehicleDetail vehicle={v} cachedPhotoUuids={data.cachedPhotoUuids} allowPhotos={false} />
	</div>
</div>
