<script lang="ts">
	import StatusBadge from '../StatusBadge.svelte';
	import type { ParsedVehicle } from '$lib/parse.js';

	let { vehicle: v }: { vehicle: ParsedVehicle } = $props();

	let remarksOpen = $state(false);

	const kgfbOk = $derived(v.kgfb.toLowerCase() === 'igen');
</script>

<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
	<h2
		class="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-3 border-b border-slate-200"
	>
		Nyilvántartás
	</h2>
	<dl class="divide-y divide-slate-100">
		{#if v.firstReg}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0 max-w-[55%]">Első forgalomba helyezés</dt>
				<dd class="text-sm font-semibold text-slate-900 text-right">{v.firstReg}</dd>
			</div>
		{/if}
		{#if v.firstHuReg}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0 max-w-[55%]">
					Első Mo.-i nyilvántartásba vétel
				</dt>
				<dd class="text-sm font-semibold text-slate-900 text-right">{v.firstHuReg}</dd>
			</div>
		{/if}
		{#if v.motExpiry}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0">Műszaki vizsga érvényes</dt>
				<dd class="text-sm font-semibold text-slate-900 text-right">{v.motExpiry}</dd>
			</div>
		{/if}
		{#if v.motDefects.length > 0}
			<div class="px-4 py-3">
				<dt class="text-sm text-slate-500 mb-1.5">Műszaki hibák</dt>
				<dd class="flex flex-col gap-1">
					{#each v.motDefects as defect (defect)}
						<span class="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{defect}</span>
					{/each}
				</dd>
			</div>
		{/if}
		{#if v.motRemarks}
			<div class="px-4 py-3">
				<button
					onclick={() => (remarksOpen = !remarksOpen)}
					class="flex items-center justify-between w-full text-sm text-slate-500 cursor-pointer"
					aria-expanded={remarksOpen}
				>
					<span>Megjegyzés</span>
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
						class="transition-transform {remarksOpen ? 'rotate-180' : ''}"
						><polyline points="6 9 12 15 18 9" /></svg
					>
				</button>
				{#if remarksOpen}
					<p class="mt-2 text-xs text-slate-400 leading-relaxed">{v.motRemarks}</p>
				{/if}
			</div>
		{/if}
		{#if v.kgfb}
			<div class="flex items-center justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0">KGFB biztosítás</dt>
				<dd class="text-right"><StatusBadge ok={kgfbOk} label={kgfbOk ? 'Igen' : 'Nem'} /></dd>
			</div>
		{/if}
		{#if v.claimsNote}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0">Kártörténet</dt>
				<dd class="text-xs text-slate-400 text-right max-w-[55%]">{v.claimsNote}</dd>
			</div>
		{/if}
	</dl>
</div>
