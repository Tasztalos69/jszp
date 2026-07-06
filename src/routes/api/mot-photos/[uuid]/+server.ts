import { json, error } from '@sveltejs/kit';
import { fetchMotImages } from '$lib/server/query.js';
import type { RequestHandler } from './$types.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const GET: RequestHandler = async ({ params }) => {
	const { uuid } = params;
	if (!UUID_RE.test(uuid)) throw error(400, 'Invalid UUID');
	const images = await fetchMotImages(uuid);
	return json(images);
};
