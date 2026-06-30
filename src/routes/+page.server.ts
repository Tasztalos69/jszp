import { env } from '$env/dynamic/private';

export const load = () => ({ username: env.UGYFELKAPU_USERNAME ?? '' });
