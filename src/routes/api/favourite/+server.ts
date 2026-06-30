import { json, error } from '@sveltejs/kit';
import { toggleFavourite, get } from '$lib/server/cache.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	const { plate } = await request.json();
	if (typeof plate !== 'string' || !/^[A-Z0-9]{6,7}$/.test(plate))
		throw error(400, 'Érvénytelen rendszám');
	if (!get(plate)) throw error(404, 'A rendszám nincs a gyorsítótárban');
	return json({ isFavourite: toggleFavourite(plate) });
};
