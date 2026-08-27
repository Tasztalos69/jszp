<script lang="ts">
	import type { ParsedVehicle } from '$lib/parse.js';

	let { vehicle: v }: { vehicle: ParsedVehicle } = $props();

	const latest = $derived(v.odometer.findLast((e) => e.km !== null && e.km !== undefined));
</script>

{#if latest}
	<div
		class="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-baseline justify-between gap-3"
	>
		<span class="text-sm text-slate-500"
			>Aktuális óraállás <span class="text-slate-400">({latest.date})</span></span
		>
		<span class="text-sm font-semibold text-slate-900 tabular-nums"
			>{latest.km!.toLocaleString('hu-HU')} km</span
		>
	</div>
{/if}
