<script lang="ts">
	let { queryDate }: { queryDate: string } = $props();

	const formatted = $derived(queryDate.replace(/^Az adatszolgáltatás időpontja:\s*/i, ''));
</script>

{#if formatted}
	<p class="text-center text-xs text-slate-400">{formatted}</p>
{/if}
