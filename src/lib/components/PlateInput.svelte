<script lang="ts">
	import Plate from './Plate.svelte';

	let {
		value = $bindable(''),
		placeholder = 'ABC123',
		oninput
	}: {
		value?: string;
		placeholder?: string;
		oninput?: (e: Event) => void;
	} = $props();
</script>

<Plate>
	<input
		type="text"
		class="flex-1 w-0 border-none outline-none bg-transparent px-3 py-2.5 text-[#111] uppercase placeholder-[#ccc] select-auto"
		style="font-family:'Arial Black','Arial Bold','Titillium Web',Arial,sans-serif;font-weight:900;font-size:1.8rem;letter-spacing:0.1em"
		{placeholder}
		maxlength="7"
		autocomplete="off"
		autocapitalize="characters"
		spellcheck="false"
		aria-label="Rendszám"
		{value}
		{oninput}
	/>
</Plate>
