import { env } from '$env/dynamic/private';

export async function notify(message: string): Promise<void> {
	const ntfy = env.NTFY_URL;
	const discord = env.DISCORD_WEBHOOK_URL;

	if (ntfy) {
		fetch(ntfy, {
			method: 'POST',
			body: message,
			headers: { Title: 'JSZP', Priority: 'high' }
		}).catch(() => {});
	}

	if (discord) {
		fetch(discord, {
			method: 'POST',
			body: JSON.stringify({ content: message }),
			headers: { 'Content-Type': 'application/json' }
		}).catch(() => {});
	}
}
