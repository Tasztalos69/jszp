import { forceReauth, getStatus } from '$lib/server/session.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = () => {
	if (getStatus() === 'initializing') return new Response(null, { status: 409 });
	forceReauth();
	return new Response(null, { status: 204 });
};
