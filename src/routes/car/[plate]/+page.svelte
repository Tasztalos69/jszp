<script lang="ts">
	import Plate from '$lib/components/Plate.svelte';
	import StarIcon from '$lib/components/StarIcon.svelte';
	import VehicleDetail from '$lib/components/VehicleDetail.svelte';
	import CarPageHeader from '$lib/components/CarPageHeader.svelte';
	import UsefulLinksCard from '$lib/components/UsefulLinksCard.svelte';
	import VehicleLabelInput from '$lib/components/VehicleLabelInput.svelte';
	import FetchDate from '$lib/components/FetchDate.svelte';
	import AppVersionFooter from '$lib/components/AppVersionFooter.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
	const v = $derived(data.vehicle);

	let isFavourite = $state(data.isFavourite);

	async function toggleFav() {
		isFavourite = !isFavourite;
		const res = await fetch('/api/favourite', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ plate: v.plate })
		});
		if (!res.ok) isFavourite = !isFavourite;
	}
</script>

<svelte:head>
	<title>{v.plate} – {v.make} {v.model} | JSZP</title>
</svelte:head>

<div class="min-h-dvh bg-slate-50">
	<CarPageHeader plate={v.plate} fromCache={data.fromCache} cachedAt={data.cachedAt} />

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

		<VehicleLabelInput plate={v.plate} label={data.label} />

		<UsefulLinksCard
			plate={v.plate}
			hasznaltautoUrl={data.hasznaltautoUrl}
			kocsiUrl={data.kocsiUrl}
		/>

		<FetchDate queryDate={v.queryDate} />

		<AppVersionFooter />
	</div>
</div>
