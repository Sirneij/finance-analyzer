import { LRUCache } from 'lru-cache';

interface UserCache {
	user: any;
	timestamp: number;
}

const SESSION_TTL = 1000 * 60 * 15; // 15 minutes
const MAX_CACHE_SIZE = 1000;

export const sessionCache = new LRUCache<string, UserCache>({
	max: MAX_CACHE_SIZE,
	ttl: SESSION_TTL
});

export const PUBLIC_PATHS = [
	'/static',
	'/favicon.ico',
	'/_app',
	'/api/public',
	'/api/auth',
	'/finanalyzer/auth'
];
