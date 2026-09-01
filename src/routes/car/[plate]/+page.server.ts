import { error } from '@sveltejs/kit';
import { lookupPlate } from '$lib/server/query.js';
import { getStatus } from '$lib/server/session.js';
import { parseVehicle } from '$lib/parse.js';
import * as cache from '$lib/server/cache.js';
import { buildHasznaltautoUrl } from '$lib/server/providers/hasznaltauto.js';
import { buildKocsiUrl } from '$lib/server/providers/kocsi.js';
import type { PageServerLoad } from './$types.js';
import type { ParsedVehicle } from '$lib/parse.js';

export const load: PageServerLoad = async ({ params, url }) => {
	const plate = params.plate.toUpperCase();
	if (!/^[A-Z0-9]{6,7}$/.test(plate)) throw error(400, 'Érvénytelen rendszám');

	const cachedPhotoUuids = (vehicle: ParsedVehicle) =>
		(vehicle.motGalleries ?? []).filter((g) => cache.hasPhotoCache(g.uuid)).map((g) => g.uuid);

	if (!url.searchParams.has('refresh')) {
		const hit = cache.get(plate);
		if (hit)
			return {
				vehicle: hit.vehicle,
				fromCache: true,
				cachedAt: hit.fetchedAt,
				isFavourite: cache.isFavourite(plate),
				label: cache.getLabel(plate),
				cachedPhotoUuids: cachedPhotoUuids(hit.vehicle),
				hasznaltautoUrl: buildHasznaltautoUrl(hit.vehicle),
				kocsiUrl: buildKocsiUrl(hit.vehicle)
			};
	}

	if (getStatus() !== 'alive') throw error(503, 'A szerver még nem csatlakozott. Kérjük, várjon.');

	try {
		const raw = await lookupPlate(plate);
		const vehicle = parseVehicle(raw);
		cache.set(plate, vehicle);
		return {
			vehicle,
			fromCache: false,
			cachedAt: Date.now(),
			isFavourite: cache.isFavourite(plate),
			label: cache.getLabel(plate),
			cachedPhotoUuids: cachedPhotoUuids(vehicle),
			hasznaltautoUrl: buildHasznaltautoUrl(vehicle),
			kocsiUrl: buildKocsiUrl(vehicle)
		};
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg.includes('nem került kiadásra')) throw error(404, msg);
		if (msg.includes('ismételje meg')) throw error(429, msg);
		throw error(500, `Lekérdezés sikertelen: ${msg}`);
	}
};
