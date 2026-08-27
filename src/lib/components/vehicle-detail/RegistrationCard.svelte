<script lang="ts">
	import type { ParsedVehicle } from '$lib/parse.js';

	let { vehicle: v }: { vehicle: ParsedVehicle } = $props();

	const categoryLabel = $derived(v.category.replace(/^[A-Z]\d+\s*-\s*/i, '').trim());
	const chevronPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12'%3E%3Cpolyline points='0,12 12,0 24,12' fill='none' stroke='rgba(0%2C60%2C30%2C0.07)' stroke-width='1' stroke-linejoin='round'/%3E%3C/svg%3E")`;
</script>

<div
	class="rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden"
	style="background: linear-gradient(110deg, #3ecf8e 0%, #7ee8a2 30%, #c5f068 65%, #f9f591 100%);"
	role="region"
	aria-label="Jármű alapadatok"
>
	<div
		class="absolute inset-0 pointer-events-none"
		style="background-image: {chevronPattern}; background-size: 24px 12px;"
	></div>
	<p class="text-xs font-bold uppercase tracking-widest text-[#1a3a2a] mb-0.5">{v.make}</p>
	<p
		class="text-4xl font-extrabold text-[#0f2218] leading-tight mb-0.5"
		style="letter-spacing:-0.01em"
	>
		{v.model}
	</p>
	{#if categoryLabel}
		<p class="text-sm text-[#2d5a3d] mb-4">{categoryLabel}</p>
	{:else}
		<div class="mb-4"></div>
	{/if}
	<div class="flex flex-col gap-1.5">
		<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
			{#if v.year}<span class="bg-[#0f4c2a] text-white text-sm font-bold px-2.5 py-0.5 rounded"
					>{v.year}</span
				>{/if}
			{#if v.displacement}<span class="text-sm font-semibold text-[#1a3a2a]">{v.displacement}</span
				>{/if}
			{#if v.powerKw}<span class="text-sm font-semibold text-[#1a3a2a]"
					>{v.powerKw}{v.powerLe ? ` / ${v.powerLe} LE` : ''}</span
				>{/if}
			{#if v.awd === 'Igen'}<span
					class="bg-[#0f4c2a] text-white text-sm font-bold px-2.5 py-0.5 rounded">4x4</span
				>{/if}
		</div>
		<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
			{#if v.fuel}<span class="text-sm text-[#2d5a3d]">{v.fuel}</span>{/if}
			{#if v.transmission}<span class="text-sm text-[#2d5a3d]">{v.transmission}</span>{/if}
			{#if v.color || v.seats}<span class="text-sm text-[#2d5a3d]"
					>{[v.color, v.seats ? `${v.seats} fő` : ''].filter(Boolean).join(', ')}</span
				>{/if}
		</div>
	</div>
</div>
