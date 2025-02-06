import { PUBLIC_PATHS, sessionCache } from '$lib/server/sessionCache.server';
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
	// Skip auth check for public paths
	if (PUBLIC_PATHS.some((path) => event.url.pathname.startsWith(path))) {
		return await resolve(event);
	}

	//   User is already logged in
	if (event.locals.user) {
		return await resolve(event);
	}

	// Check if session cookie is present
	const session = event.cookies.get('connect.sid');

	if (!session) {
		// No session cookie, proceed without user
		console.warn('No session cookie found');
		event.locals.user = undefined;
		return await resolve(event);
	}

	// Check cache first
	const cachedData = sessionCache.get(session);
	if (cachedData) {
		event.locals.user = cachedData.user;
		return await resolve(event);
	}

	// Only fetch if not in cache
	try {
		const res = await event.fetch(`${BASE_API_URI}/v1/auth/session`);

		if (!res.ok) {
			return await resolve(event);
		}

		const { user } = await res.json();

		// Cache the result
		sessionCache.set(session, {
			user,
			timestamp: Date.now()
		});

		event.locals.user = user;
	} catch (error) {
		console.error('Session fetch error:', error);
	}

	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');

	return response;
};
