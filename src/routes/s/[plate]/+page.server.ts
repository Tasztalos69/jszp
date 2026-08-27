import { error } from '@sveltejs/kit';
import * as cache from '$lib/server/cache.js';
import { buildHasznaltautoUrl } from '$lib/server/hasznaltauto.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ params }) => {
	const plate = params.plate.toUpperCase();
	if (!/^[A-Z0-9]{6,7}$/.test(plate)) throw error(400, 'Érvénytelen rendszám');

	const hit = cache.get(plate);
	if (!hit) throw error(404, 'Jármű nem található');

	const cachedPhotoUuids = (hit.vehicle.motGalleries ?? [])
		.filter((g) => cache.hasPhotoCache(g.uuid))
		.map((g) => g.uuid);
	return {
		vehicle: hit.vehicle,
		cachedAt: hit.fetchedAt,
		label: cache.getLabel(plate),
		cachedPhotoUuids,
		hasznaltautoUrl: buildHasznaltautoUrl(hit.vehicle)
	};
};
