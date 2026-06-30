import { debug } from './log.js';

export const PROCESS_URL = 'https://magyarorszag.hu/snap/repo03/mapper/process.php';
export const BROWSER_HEADERS = {
	'User-Agent':
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0',
	Referer: 'https://magyarorszag.hu/jszp_szuf',
	'X-Requested-With': 'XMLHttpRequest'
} as const;

export type Session = { cookies: string; secureToken: string };

export async function processPost(
	{ cookies, secureToken }: Session,
	mapperID: string,
	tabId: string,
	extra: Record<string, string> = {}
): Promise<Record<string, unknown>> {
	const form = new FormData();
	for (const [k, v] of Object.entries(extra)) form.append(k, v);
	form.append('_sys_language', 'hu');
	form.append('_sys_Variables', '{}');
	form.append('_sys_ClientSessionValues', '{}');
	form.append('_sys_MapperID', mapperID);
	form.append('_sys_TabID', tabId);

	const res = await fetch(PROCESS_URL, {
		method: 'POST',
		headers: { cookie: cookies, 'X-SNAP-SECURE-TOKEN': secureToken, ...BROWSER_HEADERS },
		body: form,
		signal: AbortSignal.timeout(15_000)
	});
	const text = await res.text();
	debug('http', `process.php mapper=${mapperID} status=${res.status} body=${text.slice(0, 300)}`);
	if (!res.ok)
		throw new Error(`process.php mapper=${mapperID} HTTP ${res.status}: ${text.slice(0, 200)}`);
	let parsed: Record<string, unknown>;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error(`process.php mapper=${mapperID} non-JSON: ${text.slice(0, 200)}`);
	}
	if (typeof parsed.ErrorMessage === 'string')
		throw new Error(`process.php mapper=${mapperID}: ${parsed.ErrorMessage}`);
	return parsed;
}
