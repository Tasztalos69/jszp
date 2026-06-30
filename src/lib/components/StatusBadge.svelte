<script lang="ts">
	let { ok, label }: { ok: boolean; label: string } = $props();
</script>

<span
	class="inline-flex items-center gap-1.5 font-semibold text-sm"
	class:text-green-600={ok}
	class:text-red-600={!ok}
>
	<span
		class="size-2 rounded-full shrink-0"
		class:bg-green-600={ok}
		class:bg-red-600={!ok}
		aria-hidden="true"
	></span>
	{label}
</span>
