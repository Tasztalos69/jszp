<script lang="ts">
	import { resolve } from '$app/paths';

	let { plate, fromCache, cachedAt }: { plate: string; fromCache: boolean; cachedAt: number } =
		$props();

	let copied = $state(false);

	function copyLink() {
		const url = `${window.location.origin}/s/${plate}`;
		navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	const cachedDate = $derived(
		new Date(cachedAt).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' })
	);
</script>

<header
	class="sticky top-0 z-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 py-3"
>
	<a
		href={resolve('/')}
		class="flex items-center gap-1.5 text-sky-700 font-medium text-sm min-h-11 hover:underline"
	>
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg
		>
		Keresés
	</a>
	<div class="flex items-center gap-3">
		{#if fromCache}
			<span class="text-xs text-slate-400 hidden sm:inline">{cachedDate}</span>
			<a
				href={resolve(`/car/${plate}?refresh=1`)}
				class="text-xs font-medium text-sky-700 hover:underline">Frissítés</a
			>
		{/if}
		<button
			onclick={copyLink}
			aria-label="Link másolása"
			class="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-400 rounded-md px-3 py-2 text-sm min-h-[36px] transition-colors cursor-pointer"
		>
			{#if copied}
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg
				>
				Másolva
			{:else}
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					><rect x="9" y="9" width="13" height="13" rx="2" /><path
						d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
					/></svg
				>
				Másolás
			{/if}
		</button>
	</div>
</header>
