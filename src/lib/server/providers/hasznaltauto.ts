import type { ParsedVehicle } from '$lib/parse.js';
import hahuData from './hasznaltauto-data.json' with { type: 'json' };
import { encodeSearchToken } from './php-search-token.js';
import { normalize, matchModell, parseDisplacementCc } from './similar-car-match.js';

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

function matchUzemanyag(fuelText: string): number[] | null {
	const lower = fuelText.toLowerCase();
	for (const [re, ids] of UZEMANYAG) if (re.test(lower)) return ids;
	return null;
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

	const modellId = matchModell(MODELS[String(markaId)], vehicle.make, vehicle.model);
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

	return `https://www.hasznaltauto.hu/talalatilista/${encodeSearchToken(filters)}`;
}
