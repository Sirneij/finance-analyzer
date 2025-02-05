import { vi } from 'vitest';

vi.stubGlobal('navigator', {
	platform: '',
	userAgent: ''
});

vi.stubGlobal('window', {
	location: {
		href: 'http://localhost:3000/test'
	}
});
