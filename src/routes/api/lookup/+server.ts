import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lookupPlate } from '$lib/server/query.js';
import { notify } from '$lib/server/notify.js';

// Hungarian plates: county code (2-3 letters) + 3 digits, or 6-7 alphanumeric (temp/custom)
const PLATE_RE = /^[A-Z0-9]{6,7}$/;

export const GET: RequestHandler = async ({ url }) => {
	const plate = url.searchParams.get('plate')?.trim().toUpperCase();
	if (!plate) return json({ error: 'missing plate' }, { status: 400 });
	if (!PLATE_RE.test(plate)) return json({ error: 'invalid plate format' }, { status: 400 });

	try {
		const data = await lookupPlate(plate);
		return json(data);
	} catch (e) {
		console.error(e);
		notify(`JSZP lookup failed for ${plate}: ${e}`);
		return json({ error: 'lookup failed' }, { status: 500 });
	}
};
