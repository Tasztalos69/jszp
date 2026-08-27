<script lang="ts">
	let { plate, label = '' }: { plate: string; label?: string } = $props();

	let value = $state(label);

	async function save() {
		await fetch('/api/label', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ plate, label: value })
		});
	}
</script>

<div class="flex flex-col gap-1.5">
	<label for="vehicle-label" class="text-xs font-bold uppercase tracking-widest text-slate-400"
		>Megjegyzés</label
	>
	<input
		id="vehicle-label"
		type="text"
		placeholder="Pl. Ádám autója"
		maxlength="60"
		bind:value
		onblur={save}
		class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-colors"
	/>
</div>
