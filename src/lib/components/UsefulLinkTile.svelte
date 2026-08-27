<script lang="ts">
	let {
		href,
		name,
		text,
		accent,
		hint
	}: { href: string; name: string; text: string; accent: string; hint?: string } = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external site, not an app route -->
<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="group relative flex min-h-16 items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300"
	style="--accent: {accent}"
>
	<div
		class="pointer-events-none absolute inset-0"
		style="background-image: linear-gradient(to left, var(--accent) 0%, color-mix(in srgb, var(--accent) 30%, white) 22%, white 55%);"
	></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
		style="background-image: linear-gradient(to left, var(--accent) 0%, color-mix(in srgb, var(--accent) 45%, white) 30%, white 62%);"
	></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-25 transition-opacity duration-200 group-hover:opacity-40"
		style="
			background-image: radial-gradient(rgba(255, 255, 255, 0.9) 1.6px, transparent 1.6px);
			background-size: 13px 13px;
			mask-image: linear-gradient(to left, black 0%, transparent 40%);
			-webkit-mask-image: linear-gradient(to left, black 0%, transparent 40%);
		"
	></div>
	<div class="relative flex min-w-0 flex-1 flex-col gap-0.5">
		<span class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--accent)"
			>{name}</span
		>
		<span class="truncate text-sm font-semibold text-slate-800">{text}</span>
		{#if hint}
			<span class="font-mono text-xs tracking-wide text-slate-400">{hint}</span>
		{/if}
	</div>
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		class="relative shrink-0 text-white transition-transform group-hover:translate-x-0.5"
		><path d="M9 6l6 6-6 6" /></svg
	>
</a>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
