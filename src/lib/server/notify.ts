import { env } from '$env/dynamic/private';

export function notify(message: string, attachment?: { data: Uint8Array; filename: string }): void {
	const ntfy = env.NTFY_URL;
	if (!ntfy) return;

	const headers: Record<string, string> = {
		Title: 'JSZP',
		Priority: 'high',
		Message: message
	};

	if (attachment) {
		headers['Filename'] = attachment.filename;
		fetch(ntfy, { method: 'PUT', headers, body: attachment.data.buffer as ArrayBuffer }).catch(() => {});
	} else {
		fetch(ntfy, { method: 'POST', headers, body: message }).catch(() => {});
	}
}
