import { env } from '$env/dynamic/private';

export function debug(module: string, ...args: unknown[]) {
	if (env.LOG_LEVEL === 'debug') console.log(`[${module}]`, ...args);
}

export function error(module: string, ...args: unknown[]) {
	console.error(`[${module}]`, ...args);
}
