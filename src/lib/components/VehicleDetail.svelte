<script lang="ts">
	import RegistrationCard from './vehicle-detail/RegistrationCard.svelte';
	import CurrentOdometer from './vehicle-detail/CurrentOdometer.svelte';
	import TechnicalDataCard from './vehicle-detail/TechnicalDataCard.svelte';
	import StatusCard from './vehicle-detail/StatusCard.svelte';
	import RegistrationDetailsCard from './vehicle-detail/RegistrationDetailsCard.svelte';
	import MotPhotosCard from './vehicle-detail/MotPhotosCard.svelte';
	import OdometerSection from './vehicle-detail/OdometerSection.svelte';
	import type { ParsedVehicle } from '$lib/parse.js';

	let {
		vehicle: v,
		cachedPhotoUuids = [],
		allowPhotos = true
	}: { vehicle: ParsedVehicle; cachedPhotoUuids?: string[]; allowPhotos?: boolean } = $props();
</script>

<RegistrationCard vehicle={v} />
<CurrentOdometer vehicle={v} />
<TechnicalDataCard vehicle={v} />
<StatusCard vehicle={v} />
<RegistrationDetailsCard vehicle={v} />
<MotPhotosCard vehicle={v} {cachedPhotoUuids} {allowPhotos} />
<OdometerSection vehicle={v} />
