<script lang="ts">
	import { version } from '../../../package.json';

	let { fixedOnDesktop = false }: { fixedOnDesktop?: boolean } = $props();
</script>

<p
	class="text-center text-xs text-slate-400 {fixedOnDesktop
		? 'sm:fixed sm:bottom-4 sm:left-4'
		: ''}"
>
	v{version}
</p>
