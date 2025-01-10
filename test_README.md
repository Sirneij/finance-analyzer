// test/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { redis } from '../src/services/db.service';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
mongoServer = await MongoMemoryServer.create();
await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
await mongoose.disconnect();
await mongoServer.stop();
await redis.quit();
});

afterEach(async () => {
await mongoose.connection.dropDatabase();
});

// test/integration/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models/user.model';

const request = supertest(app);

describe('Authentication Routes', () => {
beforeEach(async () => {
await User.deleteMany({});
});

    describe('GET /api/v1/auth/google', () => {
        it('should redirect to Google OAuth', async () => {
            const response = await request.get('/api/v1/auth/google');
            expect(response.status).toBe(302);
            expect(response.header.location).toContain('accounts.google.com');
        });
    });

    describe('GET /api/v1/auth/github', () => {
        it('should redirect to GitHub OAuth', async () => {
            const response = await request.get('/api/v1/auth/github');
            expect(response.status).toBe(302);
            expect(response.header.location).toContain('github.com');
        });
    });

    describe('GET /api/v1/auth/session', () => {
        it('should return 401 for unauthenticated user', async () => {
            const response = await request.get('/api/v1/auth/session');
            expect(response.status).toBe(401);
        });
    });

});

// test/unit/services/auth.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../../../src/services/auth.service';
import { User } from '../../../src/models/user.model';

describe('AuthService', () => {
describe('findOrCreateUser', () => {
it('should create new user if not exists', async () => {
const profile = {
id: '123',
emails: [{ value: 'test@test.com' }],
provider: 'google'
};

            const user = await AuthService.findOrCreateUser(profile);
            expect(user.email).toBe('test@test.com');
            expect(user.providerId).toBe('123');
        });
    });

});

// test/unit/middlewares/auth.middleware.test.ts
import { describe, it, expect, vi } from 'vitest';
import { isAuthenticated } from '../../../src/middlewares/auth.middleware';

describe('Auth Middleware', () => {
it('should allow authenticated requests', () => {
const req = { isAuthenticated: () => true };
const res = { status: vi.fn() };
const next = vi.fn();

        isAuthenticated(req as any, res as any, next);
        expect(next).toHaveBeenCalled();
    });

    it('should block unauthenticated requests', () => {
        const req = { isAuthenticated: () => false };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        isAuthenticated(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

});

// test/e2e/auth.flow.test.ts
import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import app from '../../src/app';

const request = supertest(app);

describe('Authentication Flow', () => {
it('should complete full auth cycle', async () => {
// 1. Start with Google login
const loginResponse = await request.get('/api/v1/auth/google');
expect(loginResponse.status).toBe(302);

        // 2. Mock callback response
        const callbackResponse = await request.get('/api/v1/auth/google/callback')
            .query({ code: 'mock_code' });
        expect(callbackResponse.status).toBe(302);

        // 3. Check session
        const sessionResponse = await request.get('/api/v1/auth/session')
            .set('Cookie', callbackResponse.headers['set-cookie']);
        expect(sessionResponse.status).toBe(200);

        // 4. Logout
        const logoutResponse = await request.get('/api/v1/auth/logout');
        expect(logoutResponse.status).toBe(302);
    });

});

// test/integration/docs.test.ts
import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import app from '../../src/app';

const request = supertest(app);

describe('Documentation Routes', () => {
it('should return API documentation', async () => {
const response = await request.get('/api/docs');
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('paths');
});
});
