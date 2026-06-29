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
	// Registration
	firstReg: string;
	firstHuReg: string;
	totalOwners: string;
	regValidUntil: string;
	// Status
	trafficStatus: string;
	stolenStatus: string;
	// MOT
	motExpiry: string;
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

function ctrlList(
	section: Record<string, unknown>,
	key: string
): Record<string, string>[] | null {
	const cv = (section as Record<string, Record<string, unknown>>).CtrlValue;
	const val = (cv?.[key] as { VALUE?: unknown })?.VALUE;
	return Array.isArray(val) ? (val as Record<string, string>[]) : null;
}

function kwToLe(kwStr: string): string {
	const match = kwStr.match(/(\d+)/);
	if (!match) return '';
	return String(Math.round(parseInt(match[1]) / 0.7355));
}

function parseMotExpiry(mot: Record<string, unknown>): string {
	const records = ctrlList(mot, 'layout_list-MuszakiAllapot');
	if (!records?.length) return '';
	// records[0] is most recent
	const alapList = records[0]['layout_list-MuszakiAllapot-AlapAdatok'];
	const alap = Array.isArray(alapList)
		? (alapList as Record<string, string>[])[0]
		: null;
	return alap?.['text-MuszakiAllapot-ErvVege'] ?? '';
}

function parseOdometer(odometer: Record<string, unknown>): OdometerEntry[] {
	const cv = (odometer as Record<string, Record<string, unknown>>).CtrlValue;
	const rows = (
		cv?.['datatable-FutasTeljesitmeny_RogzitettOraAllasok'] as { VALUE?: unknown[][] }
	)?.VALUE?.[0];
	if (!Array.isArray(rows)) return [];
	return rows.map((r) => ({
		date: (r as Record<string, string>)[
			'datatable_header-RogzitettOraAllasok_Rogzites_datuma'
		] ?? '',
		km: parseInt(
			(
				(r as Record<string, string>)[
					'datatable_header-RogzitettOraAllasok_Oraallas'
				] ?? '0'
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
	const powerKw = motor['text-Teljesitmeny'] ?? '';

	return {
		plate: data.plate,
		requestId: data.requestId,
		queryDate: ctrlVal(data.basic, 'text-adatigenyles_datum'),

		make: tipo['text-Gyartmany'] ?? '',
		model: tipo['text-Kerleiras'] ?? '',
		typeCode: tipo['text-Tipus'] ?? '',
		category: tipo['text-Kategoria'] ?? '',
		year: tipo['text-GyartasiEv'] ?? '',
		displacement: motor['text-Hengerurtartalom'] ?? '',
		powerKw,
		powerLe: kwToLe(powerKw),
		fuel: motor['text-Uzemanyag'] ?? '',
		transmission: motor['text-Sebessegvalto'] ?? '',
		color: tech['text-Szin'] ?? '',
		seats: tech['text-UlohelySzam'] ?? '',

		firstReg: alap['text-ElsoForgHelyezes'] ?? '',
		firstHuReg: alap['text-ElsoMoForgHelyezes'] ?? '',
		totalOwners: alap['text-OsszesTulaj'] ?? '',
		regValidUntil: alap['text-ErvVege'] ?? '',

		trafficStatus: ctrlVal(data.traffic, 'text-Forgtartas_Jelleg'),
		stolenStatus: stolen['text-alap_adatok-2-KorozesSzoveg'] ?? '',

		motExpiry: parseMotExpiry(data.mot),

		kgfb: ctrlVal(data.insurance, 'text-2-BiztositasKartortenet-kotelezovel_rendelkezik'),
		claimsNote: ctrlVal(data.insurance, 'text-2-BiztositasKartortenet-Nincs_adat'),

		odometer: parseOdometer(data.odometer)
	};
}
