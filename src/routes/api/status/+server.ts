import type { RequestHandler } from './$types';
import { getStatus, subscribe } from '$lib/server/session.js';

export const GET: RequestHandler = () => {
	let unsub: (() => void) | undefined;

	const stream = new ReadableStream({
		start(controller) {
			const send = (s: string) => controller.enqueue(`data: ${s}\n\n`);
			send(getStatus());
			unsub = subscribe(send);
		},
		cancel() {
			unsub?.();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
