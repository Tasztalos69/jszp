<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		value = '',
		size = 'lg',
		children
	}: { value?: string; size?: 'sm' | 'lg'; children?: Snippet } = $props();

	const starAngles = Array.from({ length: 12 }, (_, i) => (i * 30 - 90) * (Math.PI / 180));

	const stripe = $derived(
		size === 'sm'
			? { w: 40, pad: '6px 7px', svgSize: 18, r: 6.2, textSize: '0.6rem' }
			: { w: 56, pad: '8px 10px', svgSize: 26, r: 9, textSize: '0.75rem' }
	);
</script>

<div
	class="inline-flex items-stretch border-[2.5px] border-[#1a1a1a] rounded-md overflow-hidden bg-white shadow-sm select-none"
>
	<div
		class="flex flex-col items-center justify-center bg-[#2840b5] gap-1.5"
		style="min-width:{stripe.w}px;padding:{stripe.pad}"
	>
		<svg
			width={stripe.svgSize}
			height={stripe.svgSize}
			viewBox="0 0 {stripe.svgSize} {stripe.svgSize}"
			aria-hidden="true"
		>
			{#each starAngles as angle (angle)}
				{@const cx = stripe.svgSize / 2 + stripe.r * Math.cos(angle)}
				{@const cy = stripe.svgSize / 2 + stripe.r * Math.sin(angle)}
				<circle {cx} {cy} r={size === 'sm' ? 1.1 : 1.7} fill="#FFD700" />
			{/each}
		</svg>
		<span
			class="text-white font-bold leading-none"
			style="font-size:{stripe.textSize};letter-spacing:0.05em">H</span
		>
	</div>
	{#if children}
		{@render children()}
	{:else}
		<span
			class="plate-text flex items-center"
			style="font-size:{size === 'sm' ? '1rem' : '1.8rem'};padding:{size === 'sm'
				? '4px 10px'
				: '8px 14px'}"
		>
			{value}
		</span>
	{/if}
</div>

<style>
	.plate-text {
		font-family: 'Arial Black', 'Arial Bold', 'Titillium Web', Arial, sans-serif;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #111;
	}
</style>
