import type { ParsedVehicle } from '$lib/parse.js';
import kocsiData from './kocsi-data.json' with { type: 'json' };
import { encodeSearchToken } from './php-search-token.js';
import { normalize, matchModell, parseDisplacementCc } from './similar-car-match.js';

const BRANDS = kocsiData.brands as Record<string, number>;
const MODELS = kocsiData.models as Record<string, { id: number; name: string }[]>;

// uzemanyag ids, captured by selecting kocsi.hu's "benzin"/"dízel" group
// checkboxes (each auto-selects its subtypes) and cross-checked against
// individual leaf-checkbox captures.
//
// Only the two big groups + electric are mapped — narrower subtypes (LPG,
// CNG, plain etanol, hidrogén) aren't, since the registry's own fuel text
// doesn't reliably distinguish them either.
//
// The registry's ambiguous "HIB/E/B"/"HIB/E/G" hybrid codes don't need
// disambiguation here (unlike hasznaltauto.hu): the benzin/dízel groups
// already include that group's hibrid + plug-in hibrid subtypes.
const BENZIN = [2, 21, 22, 23, 24, 25];
const DIZEL = [3, 31, 32, 33, 34];
const ELEKTROMOS = [1];

const UZEMANYAG: [RegExp, number[]][] = [
	[/^hib\/e\/b/, BENZIN],
	[/^hib\/e\/g/, DIZEL],
	[/diesel|gázolaj/, DIZEL],
	[/benzin/, BENZIN],
	[/elektromos|electric/, ELEKTROMOS]
];

function matchUzemanyag(fuelText: string): number[] | null {
	const lower = fuelText.toLowerCase();
	for (const [re, ids] of UZEMANYAG) if (re.test(lower)) return ids;
	return null;
}

/**
 * Builds a kocsi.hu search-results URL for a similar vehicle, or null when we
 * shouldn't show the link: not a passenger car (M1/M1G category), or the
 * brand isn't in our seed table (scraped from kocsi.hu's own marka select).
 *
 * modell_id matching only covers the top-25 brands (the only ones we have a
 * scraped model list for) — other brands still get a marka_id-only link.
 */
export function buildKocsiUrl(vehicle: ParsedVehicle): string | null {
	if (!vehicle.category.startsWith('M1')) return null;

	const markaId = BRANDS[normalize(vehicle.make)];
	if (!markaId) return null;

	const filters: Record<string, unknown> = {
		kategoriaNev: 'szemelyauto',
		marka_id: markaId
	};

	const modellId = matchModell(MODELS[String(markaId)], vehicle.make, vehicle.model);
	if (modellId) filters.modell_id = modellId;

	const year = parseInt(vehicle.year, 10);
	if (Number.isFinite(year) && year > 1900) {
		filters.evjarat_tol = year - 1;
		filters.evjarat_ig = year + 1;
	}

	const cc = parseDisplacementCc(vehicle.displacement);
	if (cc) {
		filters.hengerurtartalom_tol = Math.round(cc * 0.9);
		filters.hengerurtartalom_ig = Math.round(cc * 1.1);
	}

	const uzemanyagIds = matchUzemanyag(vehicle.fuel);
	if (uzemanyagIds) filters.uzemanyag = uzemanyagIds;

	const jellemzok: Record<string, number> = {};
	if (/automata/i.test(vehicle.transmission)) jellemzok.automata = 1;
	if (vehicle.awd === 'Igen') jellemzok.osszkerekhajtas = 1;
	if (Object.keys(jellemzok).length > 0) filters.jellemzok = jellemzok;

	return `https://kocsi.hu/talalatilista/${encodeSearchToken(filters)}`;
}
