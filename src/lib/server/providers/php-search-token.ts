import { deflateSync } from 'node:zlib';

// PHP serialize() for the plain string/int/bool/array shapes search filters need.
export function phpSerialize(value: unknown): string {
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

// Encodes a filter object into the opaque base32(zlib(php_serialize())) token
// both hasznaltauto.hu and kocsi.hu use for their search-result URLs.
export function encodeSearchToken(filters: Record<string, unknown>): string {
	const serialized = phpSerialize(filters);
	const compressed = deflateSync(serialized, { level: 6 });
	return base32Encode(compressed);
}
