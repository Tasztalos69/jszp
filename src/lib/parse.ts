import type { VehicleData } from './server/query.js';

export type OdometerEntry = { date: string; km: number };

export type ParsedVehicle = {
	plate: string;
	requestId: string;
	queryDate: string;
	// Hero card
	make: string;
	model: string;
	typeCode: string;
	category: string;
	year: string;
	displacement: string;
	powerKw: string;
	powerLe: string;
	fuel: string;
	transmission: string;
	color: string;
	seats: string;
	// Weights
	ownWeight: string;
	grossWeight: string;
	// Registration
	firstReg: string;
	firstHuReg: string;
	totalOwners: string;
	regValidUntil: string;
	// Status
	trafficStatus: string;
	trafficStatusDate: string;
	stolenStatus: string;
	// Origin
	originNote: string;
	// MOT
	motExpiry: string;
	motDefects: string[];
	motRemarks: string;
	motGalleries: { uuid: string; date: string }[];
	// Insurance
	kgfb: string;
	claimsNote: string;
	// Odometer (ascending by date)
	odometer: OdometerEntry[];
};

function ctrlVal(section: Record<string, unknown>, key: string): string {
	const cv = (section as Record<string, Record<string, Record<string, string>>>).CtrlValue;
	return (cv?.[key] as { VALUE?: string })?.VALUE ?? '';
}

function ctrlList(section: Record<string, unknown>, key: string): Record<string, unknown>[] | null {
	const cv = (section as Record<string, Record<string, unknown>>).CtrlValue;
	const val = (cv?.[key] as { VALUE?: unknown })?.VALUE;
	return Array.isArray(val) ? (val as Record<string, unknown>[]) : null;
}

function kwToLe(kwStr: string): string {
	const match = kwStr.match(/(\d+)/);
	if (!match) return '';
	return String(Math.round(parseInt(match[1]) / 0.7355));
}

function latestMotRecord(mot: Record<string, unknown>): Record<string, unknown> | null {
	const records = ctrlList(mot, 'layout_list-MuszakiAllapot');
	return records?.[0] ?? null;
}

function parseMotExpiry(mot: Record<string, unknown>): string {
	const rec = latestMotRecord(mot);
	if (!rec) return '';
	const alapList = rec['layout_list-MuszakiAllapot-AlapAdatok'];
	const alap = Array.isArray(alapList) ? (alapList as Record<string, string>[])[0] : null;
	return alap?.['text-MuszakiAllapot-ErvVege'] ?? '';
}

function parseMotDefects(mot: Record<string, unknown>): string[] {
	const rec = latestMotRecord(mot);
	if (!rec) return [];
	const hibak = rec['layout_list-MuszakiAllapot-Hibak'];
	if (!Array.isArray(hibak)) return [];
	return (hibak as Record<string, string>[])
		.map((h) => Object.values(h).filter(Boolean).join(' '))
		.filter(Boolean);
}

function parseMotGalleries(mot: Record<string, unknown>): { uuid: string; date: string }[] {
	const records = ctrlList(mot, 'layout_list-MuszakiAllapot');
	if (!records) return [];
	return records
		.map((rec) => ({
			uuid: (rec['hidden-MuszakiAllapot_Galeria-ID'] as string) ?? '',
			date: (rec['hidden-MuszakiAllapot_Galeria-Datum'] as string) ?? ''
		}))
		.filter((g) => g.uuid);
}

function parseMotRemarks(mot: Record<string, unknown>): string {
	const rec = latestMotRecord(mot);
	if (!rec) return '';
	return ['Zaradek', 'Alvizsga', 'Hivfeljegyzes1', 'Hivfeljegyzes2']
		.map((k) => (rec[`text-MuszakiAllapot-Feljegyzesek-${k}`] as string) ?? '')
		.filter(Boolean)
		.join(' ')
		.trim();
}

function parseOdometer(odometer: Record<string, unknown>): OdometerEntry[] {
	const cv = (odometer as Record<string, Record<string, unknown>>).CtrlValue;
	const rows = (cv?.['datatable-FutasTeljesitmeny_RogzitettOraAllasok'] as { VALUE?: unknown[][] })
		?.VALUE?.[0];
	if (!Array.isArray(rows)) return [];
	return rows.map((r) => ({
		date:
			(r as Record<string, string>)['datatable_header-RogzitettOraAllasok_Rogzites_datuma'] ?? '',
		km: parseInt(
			(
				(r as Record<string, string>)['datatable_header-RogzitettOraAllasok_Oraallas'] ?? '0'
			).replace(/\s/g, ''),
			10
		)
	}));
}

export function parseVehicle(data: VehicleData): ParsedVehicle {
	const tipo = ctrlList(data.basic, 'layout_list-JarmuOkmany-TipusAdatok')?.[0] ?? {};
	const motor = ctrlList(data.basic, 'layout_list-JarmuOkmany-MotorAdatok')?.[0] ?? {};
	const tech = ctrlList(data.basic, 'layout_list-JarmuOkmany-MuszakiAdatok')?.[0] ?? {};
	const alap = ctrlList(data.basic, 'layout_list-JarmuOkmany-AlapAdatok')?.[0] ?? {};
	const stolen = ctrlList(data.basic, 'layout_list-Korozesek')?.[0] ?? {};
	const powerKw = (motor['text-Teljesitmeny'] as string) ?? '';

	return {
		plate: data.plate,
		requestId: data.requestId,
		queryDate: ctrlVal(data.basic, 'text-adatigenyles_datum'),

		make: (tipo['text-Gyartmany'] as string) ?? '',
		model: (tipo['text-Kerleiras'] as string) ?? '',
		typeCode: (tipo['text-Tipus'] as string) ?? '',
		category: (tipo['text-Kategoria'] as string) ?? '',
		year: (tipo['text-GyartasiEv'] as string) ?? '',
		displacement: (motor['text-Hengerurtartalom'] as string) ?? '',
		powerKw,
		powerLe: kwToLe(powerKw),
		fuel: (motor['text-Uzemanyag'] as string) ?? '',
		transmission: (motor['text-Sebessegvalto'] as string) ?? '',
		color: (tech['text-Szin'] as string) ?? '',
		seats: (tech['text-UlohelySzam'] as string) ?? '',
		ownWeight: (tech['text-SajatTomeg'] as string) ?? '',
		grossWeight: (tech['text-EgyuttesTomeg'] as string) ?? '',

		firstReg: (alap['text-ElsoForgHelyezes'] as string) ?? '',
		firstHuReg: (alap['text-ElsoMoForgHelyezes'] as string) ?? '',
		totalOwners: (alap['text-OsszesTulaj'] as string) ?? '',
		regValidUntil: (alap['text-ErvVege'] as string) ?? '',

		trafficStatus: ctrlVal(data.traffic, 'text-Forgtartas_Jelleg'),
		trafficStatusDate: ctrlVal(data.traffic, 'text-Forgtartas_Datum'),
		stolenStatus: (stolen['text-alap_adatok-2-KorozesSzoveg'] as string) ?? '',

		originNote: ctrlVal(data.origin, 'text-SzarmazasEredet-Nincs_adat'),

		motExpiry: parseMotExpiry(data.mot),
		motDefects: parseMotDefects(data.mot),
		motRemarks: parseMotRemarks(data.mot),
		motGalleries: parseMotGalleries(data.mot),

		kgfb: ctrlVal(data.insurance, 'text-2-BiztositasKartortenet-kotelezovel_rendelkezik'),
		claimsNote: ctrlVal(data.insurance, 'text-2-BiztositasKartortenet-Nincs_adat'),

		odometer: parseOdometer(data.odometer)
	};
}
