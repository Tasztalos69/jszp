<script lang="ts">
	import type { OdometerEntry } from '$lib/parse.js';

	let { entries }: { entries: OdometerEntry[] } = $props();

	const rows = $derived(
		entries
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

<div
	class="grid border border-slate-200 rounded-lg overflow-hidden text-sm"
	style="grid-template-columns: 1fr 1fr 1fr"
>
	<span class="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"
		>Dátum</span
	>
	<span class="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"
		>km</span
	>
	<span class="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"
		>Különbség</span
	>
	{#each rows as row (row.date + row.km + row.delta)}
		<span class="px-3 py-2.5 border-t border-slate-200 text-slate-500 text-xs">{row.date}</span>
		<span class="px-3 py-2.5 border-t border-slate-200 font-semibold tabular-nums"
			>{fmt(row.km)} km</span
		>
		<span class="px-3 py-2.5 border-t border-slate-200 text-slate-500 tabular-nums">
			{#if row.delta !== null}+{fmt(row.delta)} km{:else}—{/if}
		</span>
	{/each}
</div>
