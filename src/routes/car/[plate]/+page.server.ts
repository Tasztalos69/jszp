import { error } from '@sveltejs/kit';
import { lookupPlate } from '$lib/server/query.js';
import { parseVehicle } from '$lib/parse.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
	const plate = params.plate.toUpperCase();
	if (!/^[A-Z0-9]{6,7}$/.test(plate)) throw error(400, 'Érvénytelen rendszám');
	try {
		const raw = await lookupPlate(plate);
		return { vehicle: parseVehicle(raw) };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg.includes('nem került kiadásra')) throw error(404, msg);
		if (msg.includes('ismételje meg')) throw error(429, msg);
		throw error(500, `Lekérdezés sikertelen: ${msg}`);
	}
};
