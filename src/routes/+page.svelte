<script lang="ts">
	type Status = 'initializing' | 'alive' | 'broken';

	let status = $state<Status>('initializing');

	async function poll() {
		try {
			const res = await fetch('/api/status');
			const data = await res.json();
			status = data.status;
		} catch {
			status = 'broken';
		}
	}

	$effect(() => {
		poll();
		const id = setInterval(poll, 5000);
		return () => clearInterval(id);
	});

	const colors: Record<Status, string> = {
		initializing: 'bg-yellow-400',
		alive: 'bg-green-500',
		broken: 'bg-red-500'
	};
</script>

<div style="padding: 1rem; font-family: monospace;">
	<div style="display: flex; align-items: center; gap: 0.5rem;">
		<span
			class={colors[status]}
			style="display: inline-block; width: 10px; height: 10px; border-radius: 50%;"
		></span>
		<span>Auth: {status}</span>
	</div>
</div>
