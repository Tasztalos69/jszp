import { env } from '$env/dynamic/private';

export function notify(message: string): void {
	const ntfy = env.NTFY_URL;
	if (!ntfy) return;

	fetch(ntfy, {
		method: 'POST',
		body: message,
		headers: { Title: 'JSZP', Priority: 'high' }
	}).catch(() => {});
}
