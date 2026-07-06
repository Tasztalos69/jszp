import { chromium } from 'playwright';
import { createGuardrails, generate } from 'otplib';
import { env } from '$env/dynamic/private';
import { debug } from './log.js';
import { BROWSER_HEADERS } from './http.js';
import type { Session } from './http.js';

const JSZP_URL = 'https://magyarorszag.hu/jszp_szuf';
const RUNTIME_TOP_URL = 'https://magyarorszag.hu/snap/snut/runtime_top_utils.php';

export async function authenticate(): Promise<Session> {
	const username = env.UGYFELKAPU_USERNAME;
	const password = env.UGYFELKAPU_PASSWORD;
	const totpSecret = env.UGYFELKAPU_TOTP_SECRET;

	if (!username || !password || !totpSecret) {
		throw new Error('Missing UGYFELKAPU_USERNAME, UGYFELKAPU_PASSWORD, or UGYFELKAPU_TOTP_SECRET');
	}

	let browser: import('playwright').Browser | undefined;
	let page: import('playwright').Page | undefined;
	try {
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext();
		page = await context.newPage();

		debug('auth', 'navigating to JSZP');
		await page.goto(JSZP_URL, { waitUntil: 'networkidle' });
		await page.waitForURL(/kau\.gov\.hu\/proxy\/saml\/authservice/, { timeout: 15_000 });
		debug('auth', `landed on: ${page.url()}`);

		const cookieBtn = page.locator('button', { hasText: 'Megértettem' });
		if (await cookieBtn.isVisible()) {
			await cookieBtn.click();
			debug('auth', 'dismissed cookie banner');
		}

		debug('auth', 'expanding Ügyfélkapu+ dropdown');
		await page.click('#dropdown-control-id');
		await page.waitForSelector('#dropdown-content-id', { state: 'visible' });

		debug('auth', 'submitting TOTP auth form');
		await page.evaluate(() =>
			(
				document.getElementById('urn:eksz.gov.hu:1.0:azonositas:kau:2:uk:totp') as HTMLFormElement
			).submit()
		);

		debug('auth', 'waiting for idp.gov.hu');
		await page.waitForURL(/idp\.gov\.hu/, { timeout: 15_000 });
		debug('auth', `idp url: ${page.url()}`);

		debug('auth', 'filling credentials');
		await page.fill('[name="felhasznaloNev"]', username);
		await page.fill('[name="jelszo"]', password);
		await page.press('[name="jelszo"]', 'Enter');

		debug('auth', `post-login url: ${page.url()}`);
		debug('auth', 'waiting for TOTP form');
		await page.waitForSelector('[name="token"]', { timeout: 10_000 });
		const token = await generate({
			secret: totpSecret,
			guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 })
		});
		debug('auth', `submitting TOTP token=${token}`);
		await page.fill('[name="token"]', token);
		await page.press('[name="token"]', 'Enter');

		debug('auth', 'waiting for redirect back to magyarorszag.hu');
		await page.waitForURL(/magyarorszag\.hu/, { timeout: 15_000 });
		await page.waitForLoadState('networkidle');
		debug('auth', `final url: ${page.url()}`);

		const rawCookies = await context.cookies();
		const seen = new Map<string, string>();
		for (const c of rawCookies) seen.set(c.name, c.value);
		const cookies = [...seen.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
		debug('auth', `got ${seen.size} cookies: ${[...seen.keys()].join(', ')}`);

		const topUtils = await fetch(RUNTIME_TOP_URL, {
			headers: { cookie: cookies, ...BROWSER_HEADERS }
		});
		const topText = await topUtils.text();
		const tokenMatch = topText.match(/var g_secureToken\s*=\s*"([^"]+)"/);
		if (!tokenMatch) throw new Error('Could not extract g_secureToken from runtime_top_utils.php');
		const secureToken = tokenMatch[1];
		debug('auth', `got secureToken=${secureToken}`);

		return { cookies, secureToken };
	} catch (e) {
		if (page) {
			const { mkdirSync, writeFileSync } = await import('node:fs');
			mkdirSync('data/screenshots', { recursive: true });
			const ts = Date.now();
			await page
				.screenshot({ path: `data/screenshots/auth-fail-${ts}.png`, fullPage: true })
				.catch(() => {});
			writeFileSync(`data/screenshots/auth-fail-${ts}.html`, await page.content().catch(() => ''));
			debug('auth', `failure snapshot saved: data/screenshots/auth-fail-${ts}.png`);
		}
		throw e;
	} finally {
		await browser?.close();
	}
}
