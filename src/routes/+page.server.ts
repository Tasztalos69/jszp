import { env } from '$env/dynamic/private';
import { list } from '$lib/server/cache.js';

export const load = () => ({
	username: env.UGYFELKAPU_USERNAME ?? '',
	recent: list()
});
