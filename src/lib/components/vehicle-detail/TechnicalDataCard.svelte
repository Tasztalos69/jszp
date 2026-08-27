<script lang="ts">
	import type { ParsedVehicle } from '$lib/parse.js';

	let { vehicle: v }: { vehicle: ParsedVehicle } = $props();

	let detailsOpen = $state(false);

	const categoryLabel = $derived(v.category.replace(/^[A-Z]\d+\s*-\s*/i, '').trim());
</script>

<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
	<h2
		class="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-3 border-b border-slate-200"
	>
		Műszaki adatok
	</h2>
	<dl class="divide-y divide-slate-100">
		{#if v.ownWeight}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500">Saját tömeg</dt>
				<dd class="text-sm font-semibold text-slate-900">{v.ownWeight}</dd>
			</div>
		{/if}
		{#if v.grossWeight}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500">Megengedett össztömeg</dt>
				<dd class="text-sm font-semibold text-slate-900">{v.grossWeight}</dd>
			</div>
		{/if}
		{#if v.awd}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500">Összkerékhajtás</dt>
				<dd class="text-sm font-semibold text-slate-900">{v.awd}</dd>
			</div>
		{/if}
		{#if v.engineNumber}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500">Motorszám</dt>
				<dd class="text-sm font-semibold text-slate-900">{v.engineNumber}</dd>
			</div>
		{/if}
		{#if v.emissionClass}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500">Környezetvédelmi osztály</dt>
				<dd class="text-sm font-semibold text-slate-900 text-right">{v.emissionClass}</dd>
			</div>
		{/if}

		<div class="px-4 py-3">
			<button
				onclick={() => (detailsOpen = !detailsOpen)}
				class="flex items-center justify-between w-full text-sm text-slate-500 cursor-pointer"
				aria-expanded={detailsOpen}
			>
				<span>További adatok</span>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					class="transition-transform {detailsOpen ? 'rotate-180' : ''}"
					><polyline points="6 9 12 15 18 9" /></svg
				>
			</button>
		</div>

		{#if detailsOpen}
			{#if v.make}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Gyártmány</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.make}</dd>
				</div>
			{/if}
			{#if v.model}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Típus</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.model}</dd>
				</div>
			{/if}
			{#if categoryLabel}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Kategória</dt>
					<dd class="text-sm font-semibold text-slate-900 text-right">{categoryLabel}</dd>
				</div>
			{/if}
			{#if v.year}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Gyártási év</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.year}</dd>
				</div>
			{/if}
			{#if v.displacement}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Hengerűrtartalom</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.displacement}</dd>
				</div>
			{/if}
			{#if v.powerKw}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Teljesítmény</dt>
					<dd class="text-sm font-semibold text-slate-900">
						{v.powerKw}{v.powerLe ? ` / ${v.powerLe} LE` : ''}
					</dd>
				</div>
			{/if}
			{#if v.fuel}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Üzemanyag</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.fuel}</dd>
				</div>
			{/if}
			{#if v.transmission}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Váltó</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.transmission}</dd>
				</div>
			{/if}
			{#if v.color}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Szín</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.color}</dd>
				</div>
			{/if}
			{#if v.seats}
				<div class="flex items-baseline justify-between gap-3 px-4 py-3">
					<dt class="text-sm text-slate-500">Ülőhelyek száma</dt>
					<dd class="text-sm font-semibold text-slate-900">{v.seats}</dd>
				</div>
			{/if}
		{/if}
	</dl>
</div>
