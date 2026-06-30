<script lang="ts">
	import Plate from '$lib/components/Plate.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import OdometerList from '$lib/components/OdometerList.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
	const v = $derived(data.vehicle);

	let copied = $state(false);
	let remarksOpen = $state(false);

	function copyLink() {
		navigator.clipboard.writeText(window.location.href).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	const trafficOk = $derived(
		v.trafficStatus.toLowerCase().includes('helyez') ||
			v.trafficStatus.toLowerCase().includes('forgalom')
	);
	const stolenOk = $derived(
		v.stolenStatus.toLowerCase().includes('nem áll') ||
			v.stolenStatus.toLowerCase().includes('nincs')
	);
	const kgfbOk = $derived(v.kgfb.toLowerCase() === 'igen');
	const queryDate = $derived(v.queryDate.replace(/^Az adatszolgáltatás időpontja:\s*/i, ''));
	const categoryLabel = $derived(v.category.replace(/^[A-Z]\d+\s*-\s*/i, '').trim());

	// Chevron SVG pattern for registration card — defined here to avoid escaping issues in template
	const chevronPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12'%3E%3Cpolyline points='0,12 12,0 24,12' fill='none' stroke='rgba(0%2C60%2C30%2C0.07)' stroke-width='1' stroke-linejoin='round'/%3E%3C/svg%3E")`;
</script>

<svelte:head>
	<title>{v.plate} – {v.make} {v.model} | JSZP</title>
</svelte:head>

<div class="min-h-dvh bg-slate-50">
	<!-- Topbar -->
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
	</header>

	<div class="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
		<!-- Plate -->
		<div class="flex justify-center">
			<Plate value={v.plate} />
		</div>

		<!-- Registration card (forgalmi engedély style) -->
		<div
			class="rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden"
			style="background: linear-gradient(110deg, #3ecf8e 0%, #7ee8a2 30%, #c5f068 65%, #f9f591 100%);"
			role="region"
			aria-label="Jármű alapadatok"
		>
			<!-- Chevron / herringbone security pattern overlay -->
			<div
				class="absolute inset-0 pointer-events-none"
				style="background-image: {chevronPattern}; background-size: 24px 12px;"
			></div>
			<p class="text-xs font-bold uppercase tracking-widest text-[#1a3a2a] mb-0.5">{v.make}</p>
			<p
				class="text-4xl font-extrabold text-[#0f2218] leading-tight mb-0.5"
				style="letter-spacing:-0.01em"
			>
				{v.model}
			</p>
			{#if categoryLabel}
				<p class="text-sm text-[#2d5a3d] mb-4">{categoryLabel}</p>
			{:else}
				<div class="mb-4"></div>
			{/if}

			<div class="flex flex-col gap-1.5">
				<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
					{#if v.year}
						<span class="bg-[#0f4c2a] text-white text-sm font-bold px-2.5 py-0.5 rounded"
							>{v.year}</span
						>
					{/if}
					{#if v.displacement}
						<span class="text-sm font-semibold text-[#1a3a2a]">{v.displacement}</span>
					{/if}
					{#if v.powerKw}
						<span class="text-sm font-semibold text-[#1a3a2a]"
							>{v.powerKw}{v.powerLe ? ` / ${v.powerLe} LE` : ''}</span
						>
					{/if}
				</div>
				<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
					{#if v.fuel}<span class="text-sm text-[#2d5a3d]">{v.fuel}</span>{/if}
					{#if v.transmission}<span class="text-sm text-[#2d5a3d]">{v.transmission}</span>{/if}
					{#if v.color || v.seats}
						<span class="text-sm text-[#2d5a3d]"
							>{[v.color, v.seats ? `${v.seats} fő` : ''].filter(Boolean).join(', ')}</span
						>
					{/if}
				</div>
			</div>
		</div>

		<!-- Weights -->
		{#if v.ownWeight || v.grossWeight}
			<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
				<h2
					class="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-3 border-b border-slate-200"
				>
					Tömegadatok
				</h2>
				<dl class="divide-y divide-slate-100">
					{#if v.ownWeight}
						<div class="flex items-baseline justify-between gap-3 px-4 py-3">
							<dt class="text-sm text-slate-500">Saját tömeg</dt>
							<dd class="text-sm font-semibold text-slate-900">{v.ownWeight}</dd>
						</div>
					{/if}
					{#if v.grossWeight}
						<div class="flex items-baseline justify-between gap-3 px-4 py-3">
							<dt class="text-sm text-slate-500">Megengedett össztömeg</dt>
							<dd class="text-sm font-semibold text-slate-900">{v.grossWeight}</dd>
						</div>
					{/if}
				</dl>
			</div>
		{/if}

		<!-- Status -->
		<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
			<h2
				class="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-3 border-b border-slate-200"
			>
				Állapot
			</h2>
			<dl class="divide-y divide-slate-100">
				{#if v.trafficStatus}
					<div class="flex items-center justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0">
							Forgalmi állapot
							{#if v.trafficStatusDate}
								<span class="block text-xs text-slate-400">{v.trafficStatusDate}</span>
							{/if}
						</dt>
						<dd class="text-right"><StatusBadge ok={trafficOk} label={v.trafficStatus} /></dd>
					</div>
				{/if}
				{#if v.stolenStatus}
					<div class="flex items-center justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0">Körözés</dt>
						<dd class="text-right"><StatusBadge ok={stolenOk} label={v.stolenStatus.trim()} /></dd>
					</div>
				{/if}
				{#if v.totalOwners}
					<div class="flex items-center justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500">Tulajdonosok száma</dt>
						<dd class="text-sm font-semibold text-slate-900">{v.totalOwners}</dd>
					</div>
				{/if}
				{#if v.originNote}
					<div class="flex items-baseline justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0">Eredet</dt>
						<dd class="text-xs text-slate-400 text-right max-w-[60%]">{v.originNote}</dd>
					</div>
				{/if}
			</dl>
		</div>

		<!-- Registration details -->
		<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
			<h2
				class="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-3 border-b border-slate-200"
			>
				Nyilvántartás
			</h2>
			<dl class="divide-y divide-slate-100">
				{#if v.firstReg}
					<div class="flex items-baseline justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0 max-w-[55%]">Első forgalomba helyezés</dt>
						<dd class="text-sm font-semibold text-slate-900 text-right">{v.firstReg}</dd>
					</div>
				{/if}
				{#if v.firstHuReg}
					<div class="flex items-baseline justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0 max-w-[55%]">
							Első Mo.-i nyilvántartásba vétel
						</dt>
						<dd class="text-sm font-semibold text-slate-900 text-right">{v.firstHuReg}</dd>
					</div>
				{/if}
				{#if v.motExpiry}
					<div class="flex items-baseline justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0">Műszaki vizsga érvényes</dt>
						<dd class="text-sm font-semibold text-slate-900 text-right">{v.motExpiry}</dd>
					</div>
				{/if}
				{#if v.motDefects.length > 0}
					<div class="px-4 py-3">
						<dt class="text-sm text-slate-500 mb-1.5">Műszaki hibák</dt>
						<dd class="flex flex-col gap-1">
							{#each v.motDefects as defect (defect)}
								<span class="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{defect}</span>
							{/each}
						</dd>
					</div>
				{/if}
				{#if v.motRemarks}
					<div class="px-4 py-3">
						<button
							onclick={() => (remarksOpen = !remarksOpen)}
							class="flex items-center justify-between w-full text-sm text-slate-500 cursor-pointer"
							aria-expanded={remarksOpen}
						>
							<span>Megjegyzés</span>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
								class="transition-transform {remarksOpen ? 'rotate-180' : ''}"
								><polyline points="6 9 12 15 18 9" /></svg
							>
						</button>
						{#if remarksOpen}
							<p class="mt-2 text-xs text-slate-400 leading-relaxed">{v.motRemarks}</p>
						{/if}
					</div>
				{/if}
				{#if v.kgfb}
					<div class="flex items-center justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0">KGFB biztosítás</dt>
						<dd class="text-right"><StatusBadge ok={kgfbOk} label={kgfbOk ? 'Igen' : 'Nem'} /></dd>
					</div>
				{/if}
				{#if v.claimsNote}
					<div class="flex items-baseline justify-between gap-3 px-4 py-3">
						<dt class="text-sm text-slate-500 shrink-0">Kártörténet</dt>
						<dd class="text-xs text-slate-400 text-right max-w-[55%]">{v.claimsNote}</dd>
					</div>
				{/if}
			</dl>
		</div>

		<!-- Odometer -->
		{#if v.odometer.length > 0}
			<div>
				<h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Óraállások</h2>
				<OdometerList entries={v.odometer} />
				<p class="text-xs text-slate-400 mt-2">
					Csak magyarországi nyilvántartásokban szereplő adatok.
				</p>
			</div>
		{/if}

		{#if queryDate}
			<p class="text-center text-xs text-slate-400">{queryDate}</p>
		{/if}
	</div>
</div>
