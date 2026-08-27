import { deflateSync } from 'node:zlib';
import type { ParsedVehicle } from '$lib/parse.js';
import hahuData from './hasznaltauto-data.json' with { type: 'json' };

const BRANDS = hahuData.brands as Record<string, number>;
const MODELS = hahuData.models as Record<string, { id: number; name: string }[]>;

// uzemanyag ids for the "szemelyauto" category, from api.hasznaltauto.hu/v2/tomb.
// Checked in order — hybrid codes ("HIB/E/B", "HIB/E/G") must win over the
// generic diesel/benzin/hibrid patterns they'd otherwise also match.
//
// The registry's "HIB/E/*" code doesn't distinguish a full hybrid from a mild
// (48V) hybrid, but hasznaltauto.hu lists mild hybrids under the plain
// petrol/diesel category — so we match both ids for those codes rather than
// guess which one the car actually is.
const UZEMANYAG: [RegExp, number[]][] = [
	[/^hib\/e\/b/, [11, 1]], // Hibrid (Benzin) or plain Benzin
	[/^hib\/e\/g/, [12, 2]], // Hibrid (Dízel) or plain Dízel — registry "G" here means gázolaj
	[/diesel|gázolaj/, [2]],
	[/benzin/, [1]],
	[/hibrid|hybrid/, [5]],
	[/elektromos|electric/, [6]],
	[/etanol|ethanol/, [7]],
	[/lpg/, [8]],
	[/cng/, [9]],
	[/biodízel|biodiesel/, [10]],
	[/gáz/, [13]]
];

function normalize(s: string): string {
	return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim().replace(/\s+/g, ' ');
}

function matchModell(markaId: number, make: string, modelText: string): number | null {
	const options = MODELS[String(markaId)];
	if (!options || !modelText.trim()) return null;

	let target = normalize(modelText);
	const normMake = normalize(make);
	if (normMake && target.startsWith(normMake + ' ')) target = target.slice(normMake.length + 1);
	if (!target) return null;

	const firstToken = target.split(' ')[0];

	const exact = options.find((o) => normalize(o.name) === target);
	if (exact) return exact.id;

	const tokenMatch = options.find((o) => normalize(o.name) === firstToken);
	if (tokenMatch) return tokenMatch.id;

	// "525I" / "430D" style registry codes vs a bare "525" / "430" hasznaltauto entry
	const tokenPrefixMatches = options.filter(
		(o) => o.name.length >= 2 && firstToken.startsWith(normalize(o.name))
	);
	if (tokenPrefixMatches.length === 1) return tokenPrefixMatches[0].id;

	// "A4 AVANT" / "A4 LIMOUSINE" style trims vs a bare "A4" hasznaltauto entry
	const wordPrefixMatches = options.filter((o) => target.startsWith(normalize(o.name) + ' '));
	if (wordPrefixMatches.length === 1) return wordPrefixMatches[0].id;

	return null;
}

function matchUzemanyag(fuelText: string): number[] | null {
	const lower = fuelText.toLowerCase();
	for (const [re, ids] of UZEMANYAG) if (re.test(lower)) return ids;
	return null;
}

function parseDisplacementCc(displacement: string): number | null {
	const digits = displacement.replace(/\D/g, '');
	if (!digits) return null;
	const cc = parseInt(digits, 10);
	return cc > 0 ? cc : null;
}

// PHP serialize() for the plain string/int/bool/array shapes we build below.
function phpSerialize(value: unknown): string {
	if (value === null) return 'N;';
	if (typeof value === 'boolean') return `b:${value ? 1 : 0};`;
	if (typeof value === 'number') return `s:${String(value).length}:"${value}";`;
	if (typeof value === 'string') return `s:${Buffer.byteLength(value, 'utf8')}:"${value}";`;
	if (Array.isArray(value)) {
		const parts = value.map((v, i) => `i:${i};` + phpSerialize(v));
		return `a:${value.length}:{${parts.join('')}}`;
	}
	const entries = Object.entries(value as Record<string, unknown>);
	const parts = entries.map(([k, v]) => phpSerialize(k) + phpSerialize(v));
	return `a:${entries.length}:{${parts.join('')}}`;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf: Buffer): string {
	let bits = 0;
	let value = 0;
	let output = '';
	for (const byte of buf) {
		value = (value << 8) | byte;
		bits += 8;
		while (bits >= 5) {
			output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
			bits -= 5;
		}
	}
	if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
	return output;
}

/**
 * Builds a hasznaltauto.hu search-results URL for a similar vehicle, or null
 * when we shouldn't show the link: not a passenger car (M1/M1G category), or
 * the brand isn't in our seed table (no scraped source covers every brand).
 *
 * modell_id matching is best-effort against the site's own model list
 * (ponytail: only exact/unambiguous-prefix matches are used, never a guess —
 * a wrong model filter is worse than none).
 */
export function buildHasznaltautoUrl(vehicle: ParsedVehicle): string | null {
	if (!vehicle.category.startsWith('M1')) return null;

	const markaId = BRANDS[normalize(vehicle.make)];
	if (!markaId) return null;

	const filters: Record<string, unknown> = {
		kategoriaNev: 'szemelyauto',
		marka_id: markaId
	};

	const modellId = matchModell(markaId, vehicle.make, vehicle.model);
	if (modellId) filters.modell_id = modellId;

	const year = parseInt(vehicle.year, 10);
	if (Number.isFinite(year) && year > 1900) {
		filters.evjarat_min = year - 1;
		filters.evjarat_max = year + 1;
	}

	const cc = parseDisplacementCc(vehicle.displacement);
	if (cc) {
		filters.hengerurt_min = Math.round(cc * 0.9);
		filters.hengerurt_max = Math.round(cc * 1.1);
	}

	const uzemanyagIds = matchUzemanyag(vehicle.fuel);
	if (uzemanyagIds) filters.uzemanyag = uzemanyagIds;

	if (/automata/i.test(vehicle.transmission)) {
		filters.jellemzok = { automata: 1 };
	}

	const serialized = phpSerialize(filters);
	const compressed = deflateSync(serialized, { level: 6 });
	const code = base32Encode(compressed);

	return `https://www.hasznaltauto.hu/talalatilista/${code}`;
}
