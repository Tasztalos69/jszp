import { json, error } from '@sveltejs/kit';
import * as cache from '$lib/server/cache.js';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { plate, label } = await request.json();
	if (!plate || !/^[A-Z0-9]{6,7}$/.test(plate)) throw error(400, 'Invalid plate');
	cache.setLabel(plate, String(label ?? '').trim());
	return json({ ok: true });
};
