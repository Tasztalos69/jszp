import { authenticate } from './auth.js';
import { notify } from './notify.js';
import { debug, error } from './log.js';
import { processPost } from './http.js';
import type { Session } from './http.js';

export type SessionStatus = 'initializing' | 'alive' | 'broken';

// ponytail: global singleton, one session at a time
let session: Session | null = null;
let lastUsed = 0;
let status: SessionStatus = 'initializing';
let authPromise: Promise<void> | null = null;

const subscribers = new Set<(s: SessionStatus) => void>();

export function subscribe(fn: (s: SessionStatus) => void): () => void {
	subscribers.add(fn);
	return () => subscribers.delete(fn);
}

function setStatus(s: SessionStatus) {
	status = s;
	for (const fn of subscribers) fn(s);
}

export function getStatus(): SessionStatus {
	return status;
}

async function isAlive(): Promise<boolean> {
	if (!session) return false;
	// ponytail: skip network check if session used within last 60s
	if (Date.now() - lastUsed < 60_000) return true;
	try {
		const json = await processPost(session, '7145237804334066', 'healthcheck000000000000');
		const cv = json?.ClientVariable as { valaszkod?: string } | undefined;
		const alive = cv?.valaszkod !== 'kau_nincs_belepve';
		debug('session', `isAlive=${alive} valaszkod=${cv?.valaszkod}`);
		return alive;
	} catch (e) {
		debug('session', `isAlive check threw: ${e}`);
		return false;
	}
}

async function doAuth(): Promise<void> {
	debug('session', 'starting auth');
	setStatus('initializing');
	// ponytail: 2-min hard cap on SAML flow (Playwright can hang on slow idp)
	const timeout = new Promise<never>((_, reject) =>
		setTimeout(() => reject(new Error('auth timeout after 120s')), 120_000)
	);
	const result = await Promise.race([authenticate(), timeout]);
	session = result;
	lastUsed = Date.now();
	debug('session', `auth complete, got ${session.cookies.split(';').length} cookies`);
	setStatus('alive');
}

export async function getSession(): Promise<Session> {
	if (authPromise) {
		debug('session', 'auth in progress, waiting');
		await authPromise;
		return session!;
	}

	if (session) {
		const alive = await isAlive();
		if (alive) {
			lastUsed = Date.now();
			debug('session', 'session alive, reusing');
			return session;
		}
		debug('session', 'session dead, re-authing');
		session = null;
	}

	// Re-check in case a concurrent caller started auth during our isAlive() yield
	const pending = authPromise;
	if (pending) {
		await (pending as Promise<unknown>);
		return session!;
	}

	authPromise = doAuth()
		.catch(async (e) => {
			session = null;
			setStatus('broken');
			error('session', 'auth failed:', e);
			notify(`JSZP auth failed: ${e}`);
			throw e;
		})
		.finally(() => {
			authPromise = null;
		});

	await authPromise;
	return session!;
}

// Warm up session on module load
getSession().catch((e) => error('session', 'warmup failed:', e));
