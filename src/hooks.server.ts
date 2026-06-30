import { env } from '$env/dynamic/private';

const required = ['UGYFELKAPU_USERNAME', 'UGYFELKAPU_PASSWORD', 'UGYFELKAPU_TOTP_SECRET'];
const missing = required.filter((k) => !env[k]);
if (missing.length) {
	console.error(new Error(`Missing required environment variables: ${missing.join(', ')}`));

	process.exit(1);
}
