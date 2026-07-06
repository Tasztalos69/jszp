import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { env } from '$env/dynamic/private';
import { debug } from './log.js';
import type { ParsedVehicle } from '$lib/parse.js';

type Entry = { vehicle: ParsedVehicle; fetchedAt: number };

const MAX = env.CACHE_MAX_ENTRIES ? parseInt(env.CACHE_MAX_ENTRIES, 10) : Infinity;
const FILE = 'data/cache.json';

const store = new Map<string, Entry>();
let recent: string[] = []; // newest first
const favourites = new Set<string>();
const labels = new Map<string, string>();

// Load from disk once at startup
try {
	const raw = JSON.parse(readFileSync(FILE, 'utf8'));
	for (const [plate, entry] of Object.entries(raw.entries as Record<string, Entry>))
		store.set(plate, entry);
	recent = raw.recent ?? [];
	for (const plate of (raw.favourites as string[]) ?? []) favourites.add(plate);
	for (const [plate, label] of Object.entries((raw.labels ?? {}) as Record<string, string>))
		labels.set(plate, label);
	debug('cache', `loaded ${store.size} entries, ${favourites.size} favourites from ${FILE}`);
} catch {
	debug('cache', 'no cache file found, starting empty');
}

function save() {
	mkdirSync('data', { recursive: true });
	writeFileSync(
		FILE,
		JSON.stringify({
			entries: Object.fromEntries(store),
			recent,
			favourites: [...favourites],
			labels: Object.fromEntries(labels)
		})
	);
}

export function get(plate: string): Entry | null {
	const hit = store.get(plate) ?? null;
	debug('cache', `get plate=${plate} hit=${!!hit}`);
	return hit;
}

export function set(plate: string, vehicle: ParsedVehicle): void {
	store.set(plate, { vehicle, fetchedAt: Date.now() });
	recent = [plate, ...recent.filter((p) => p !== plate)];
	if (isFinite(MAX) && recent.length > MAX) {
		const evicted = recent.splice(MAX);
		for (const p of evicted) store.delete(p);
		debug('cache', `evicted plates=${evicted.join(',')} (max=${MAX})`);
	}
	debug('cache', `set plate=${plate} total=${store.size}`);
	save();
}

export function toggleFavourite(plate: string): boolean {
	if (favourites.has(plate)) {
		favourites.delete(plate);
	} else {
		favourites.add(plate);
	}
	const state = favourites.has(plate);
	debug('cache', `toggleFavourite plate=${plate} isFavourite=${state}`);
	save();
	return state;
}

export function isFavourite(plate: string): boolean {
	return favourites.has(plate);
}

export function setLabel(plate: string, label: string): void {
	if (label) {
		labels.set(plate, label);
	} else {
		labels.delete(plate);
	}
	debug('cache', `setLabel plate=${plate} label=${label}`);
	save();
}

export function getLabel(plate: string): string {
	return labels.get(plate) ?? '';
}

export type RecentEntry = { plate: string; fetchedAt: number; isFavourite: boolean; label: string };

export function list(): RecentEntry[] {
	const toEntry = (plate: string) => ({
		plate,
		fetchedAt: store.get(plate)!.fetchedAt,
		isFavourite: favourites.has(plate),
		label: labels.get(plate) ?? ''
	});
	const favs = recent.filter((p) => favourites.has(p));
	const rest = recent.filter((p) => !favourites.has(p));
	return [...favs, ...rest].map(toEntry);
}
