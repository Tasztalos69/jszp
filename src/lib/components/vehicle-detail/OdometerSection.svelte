<script lang="ts">
	import type { ParsedVehicle } from '$lib/parse.js';

	let { vehicle: v }: { vehicle: ParsedVehicle } = $props();

	const rows = $derived(
		v.odometer
			.filter((e) => e.km !== null && e.km !== undefined)
			.slice()
			.reverse()
			.map((entry, i, arr) => {
				const prev = arr[i + 1];
				const delta = prev ? entry.km! - prev.km! : null;
				return { ...entry, delta };
			})
	);

	function fmt(n: number): string {
		return n.toLocaleString('hu-HU');
	}
</script>

{#if v.odometer.length > 0}
	<div>
		<h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Óraállások</h2>
		<div
			class="grid border border-slate-200 rounded-lg overflow-hidden text-sm"
			style="grid-template-columns: 1fr 1fr 1fr"
		>
			<span
				class="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"
				>Dátum</span
			>
			<span
				class="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"
				>km</span
			>
			<span
				class="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"
				>Különbség</span
			>
			{#each rows as row (row.date + row.km + row.delta)}
				<span class="px-3 py-2.5 border-t border-slate-200 text-slate-500 text-xs">{row.date}</span>
				<span class="px-3 py-2.5 border-t border-slate-200 font-semibold tabular-nums"
					>{fmt(row.km ?? 0)} km</span
				>
				<span class="px-3 py-2.5 border-t border-slate-200 text-slate-500 tabular-nums">
					{#if row.delta !== null}+{fmt(row.delta)} km{:else}—{/if}
				</span>
			{/each}
		</div>
		<p class="text-xs text-slate-400 mt-2">
			Csak magyarországi nyilvántartásokban szereplő adatok.
		</p>
	</div>
{/if}
