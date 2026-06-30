import { randomBytes } from 'crypto';
import { getSession } from './session.js';
import { debug } from './log.js';
import { processPost, BROWSER_HEADERS } from './http.js';

const PAGE_URL = 'https://magyarorszag.hu/snap/snut/get_page.php';
const DATA_CATEGORIES =
	'JarmuOkmany,SzarmazasEredet,ForgtartasForgkorlat,MuszakiAllapot,FutasTeljesitmeny,BiztositasKartortenet';

function makeTabId(): string {
	return randomBytes(16).toString('base64url').slice(0, 22);
}

export type VehicleData = {
	plate: string;
	requestId: string;
	basic: Record<string, unknown>;
	origin: Record<string, unknown>;
	traffic: Record<string, unknown>;
	mot: Record<string, unknown>;
	odometer: Record<string, unknown>;
	insurance: Record<string, unknown>;
};

// ponytail: global lock — server stores query state per PHP session, not per tabId.
// Concurrent lookups would corrupt each other's results.
let lookupQueue: Promise<unknown> = Promise.resolve();

export function lookupPlate(plate: string): Promise<VehicleData> {
	const result = lookupQueue.then(() => doLookup(plate));
	// Chain so the next caller waits, but don't let a failure block the queue forever
	lookupQueue = result.catch(() => {});
	return result;
}

async function doLookup(plate: string): Promise<VehicleData> {
	const session = await getSession();
	const tabId = makeTabId();
	debug('query', `looking up plate=${plate} tabId=${tabId}`);

	// Register tabId server-side — process.php rejects any unregistered TabID with 409
	const pageRes = await fetch(`${PAGE_URL}?page_name=jszp_szuf&panel=M&tab_id=${tabId}`, {
		headers: { cookie: session.cookies, ...BROWSER_HEADERS }
	});
	debug('query', `get_page.php status=${pageRes.status}`);

	// Submit query
	const submitResult = await processPost(session, '7245949645153563', tabId, {
		'hidden-rendszam': plate,
		'hidden-valasztott_adatkorok': DATA_CATEGORIES
	});

	const valaszSzoveg = (submitResult?.ClientVariable as Record<string, string> | undefined)
		?.valasz_szoveg;
	if (valaszSzoveg) throw new Error(valaszSzoveg);

	// Confirm response ready
	await processPost(session, '7353894522179297', tabId);

	// Fetch all data sections in parallel
	const [basic, origin, traffic, mot, odometer, insurance] = await Promise.all([
		processPost(session, '7404720745143572', tabId),
		processPost(session, '7857411745138117', tabId),
		processPost(session, '7493691745129182', tabId),
		processPost(session, '7393854745198637', tabId),
		processPost(session, '7439065745191064', tabId),
		processPost(session, '7229902745155116', tabId)
	]);

	const requestId =
		(basic?.CtrlValue as Record<string, { VALUE: string }>)?.['header-kerelem_azonosito']?.VALUE ??
		'';

	return { plate, requestId, basic, origin, traffic, mot, odometer, insurance };
}
