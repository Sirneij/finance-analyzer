import { BASE_API_URI } from '$lib/utils/contants';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.locals.user) {
		// if there is already a user  in session load page as normal
		return await resolve(event);
	}

	// get cookies from browser
	const session = event.cookies.get('connect.sid');

	if (!session) {
		// if there is no session load page as normal
		console.warn('No session found');
		return await resolve(event);
	}

	// find the user based on the session
	const res = await event.fetch(`${BASE_API_URI}/v1/auth/session`, {
		credentials: 'include',
		headers: {
			Cookie: `connect.sid=${session}`
		}
	});

	if (!res.ok) {
		// if there an error load page as normal
		console.error(`Error fetching user: ${res.statusText}`);
		return await resolve(event);
	}

	// if `user` exists set `events.local`
	const { user } = await res.json();

	event.locals.user = user;

	// load page as normal
	return await resolve(event);
};
