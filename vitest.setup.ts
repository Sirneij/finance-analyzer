import { vi, expect } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

vi.stubGlobal('navigator', {
	platform: '',
	userAgent: ''
});

vi.stubGlobal('window', {
	location: {
		href: 'http://localhost:3000/test'
	}
});

expect.extend(matchers);
