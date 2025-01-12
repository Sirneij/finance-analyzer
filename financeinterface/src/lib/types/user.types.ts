export interface User {
	_id: string;
	email: string;
	name: string;
	avatar?: string;
	provider: string;
	providerId: number;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
