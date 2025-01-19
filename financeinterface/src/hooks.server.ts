import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/cloudflare';
import type { Handle } from '@sveltejs/kit';
import { BASE_API_URI } from '$lib/utils/contants';

const handleInitSentry: Handle = ({ event, resolve }) => {
	return event.platform
		? Sentry.wrapRequestHandler(
				{
					options: {
						dsn: 'https://348b21971fe395af3a7a3a544534b35c@o4508670763663360.ingest.us.sentry.io/4508670765629440',
						tracesSampleRate: 1.0
					},
					request: event.request as any,
					context: (event.platform as any).ctx
				},
				() => resolve(event)
			)
		: resolve(event);
};

const handleSession: Handle = async ({ event, resolve }) => {
	if (event.locals.user) {
		return await resolve(event);
	}

	const session = event.cookies.get('connect.sid');

	if (!session) {
		console.warn('No session found');
		return await resolve(event);
	}

	try {
		const res = await event.fetch(`${BASE_API_URI}/v1/auth/session`, {
			credentials: 'include',
			headers: {
				Cookie: `connect.sid=${session}`
			}
		});

		if (!res.ok) {
			throw new Error(res.statusText);
		}

		const { user } = (await res.json()) as { user: any };
		event.locals.user = user;
	} catch (error) {
		console.error(`Error fetching user: ${error}`);
	} finally {
		return await resolve(event);
	}
};

export const handle = sequence(handleInitSentry, sentryHandle(), handleSession);
export const handleError = handleErrorWithSentry();
