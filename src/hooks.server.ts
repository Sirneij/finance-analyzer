import { BASE_API_URI } from '$lib/utils/contants';
import type { Handle } from '@sveltejs/kit';

// hooks.server.ts
export const handleFetch = async ({ request, fetch }) => {
	// Add credentials: 'include' to all outgoing requests
	const options: RequestInit = {
		...request,
		credentials: 'include'
	};

	return fetch(request, options);
};

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
	const res = await event.fetch(`${BASE_API_URI}/v1/auth/session`);

	if (!res.ok) {
		// if there an error load page as normal
		console.error(`Error fetching user: ${res.statusText}`);
		return await resolve(event);
	}

	// if `user` exists set `events.local`
	const { user } = await res.json();

	event.locals.user = user;

	// Get the response from the route
	const response = await resolve(event);

	// Security headers
	// response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	// response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	// // Consider adding these modern headers too:
	// response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};
