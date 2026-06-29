import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStatus } from '$lib/server/session.js';

export const GET: RequestHandler = () => json({ status: getStatus() });
