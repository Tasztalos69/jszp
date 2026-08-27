<script lang="ts">
	import StatusBadge from '../StatusBadge.svelte';
	import type { ParsedVehicle } from '$lib/parse.js';

	let { vehicle: v }: { vehicle: ParsedVehicle } = $props();

	const trafficOk = $derived(
		v.trafficStatus.toLowerCase().includes('helyez') ||
			v.trafficStatus.toLowerCase().includes('forgalom')
	);
	const stolenOk = $derived(
		v.stolenStatus.toLowerCase().includes('nem áll') ||
			v.stolenStatus.toLowerCase().includes('nincs')
	);
</script>

<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
	<h2
		class="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-3 border-b border-slate-200"
	>
		Állapot
	</h2>
	<dl class="divide-y divide-slate-100">
		{#if v.trafficStatus}
			<div class="flex items-center justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0">
					Forgalmi állapot
					{#if v.trafficStatusDate}<span class="block text-xs text-slate-400"
							>{v.trafficStatusDate}</span
						>{/if}
				</dt>
				<dd class="text-right"><StatusBadge ok={trafficOk} label={v.trafficStatus} /></dd>
			</div>
		{/if}
		{#if v.stolenStatus}
			<div class="flex items-center justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0">Körözés</dt>
				<dd class="text-right"><StatusBadge ok={stolenOk} label={v.stolenStatus.trim()} /></dd>
			</div>
		{/if}
		{#if v.totalOwners}
			<div class="flex items-center justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500">Tulajdonosok száma</dt>
				<dd class="text-sm font-semibold text-slate-900">{v.totalOwners}</dd>
			</div>
		{/if}
		{#if v.originNote}
			<div class="flex items-baseline justify-between gap-3 px-4 py-3">
				<dt class="text-sm text-slate-500 shrink-0">Eredet</dt>
				<dd class="text-xs text-slate-400 text-right max-w-[60%]">{v.originNote}</dd>
			</div>
		{/if}
	</dl>
</div>
