<script lang="ts">
	import UsefulLinkTile from './UsefulLinkTile.svelte';

	let {
		plate,
		hasznaltautoUrl,
		kocsiUrl
	}: { plate: string; hasznaltautoUrl: string | null; kocsiUrl: string | null } = $props();
</script>

<div>
	<h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Hasznos linkek</h2>
	<div class="flex flex-col gap-2.5">
		<UsefulLinkTile
			href="https://nemzetiutdij.hu/hu/e-matrica/matrica-lekerdezes"
			name="Nemzeti Útdíj"
			text="Matrica lekérdezése"
			hint="H {plate}"
			accent="#5784A5"
		/>

		{#if hasznaltautoUrl}
			<UsefulLinkTile
				href={hasznaltautoUrl}
				name="Hasznaltauto.hu"
				text="Eladó hasonló autók"
				accent="#FF4200"
			/>
		{/if}

		{#if kocsiUrl}
			<UsefulLinkTile href={kocsiUrl} name="Kocsi.hu" text="Eladó hasonló autók" accent="#03A9F4" />
		{/if}
	</div>
</div>
