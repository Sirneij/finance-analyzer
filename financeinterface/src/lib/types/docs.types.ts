export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type SupportedLanguage = 'nodejs' | 'python' | 'go' | 'rust';

export interface Endpoint {
	path: string;
	method: HttpMethod;
	middlewares: string[];
	category: string;
	description: string;
	parameters?: {
		name: string;
		type: string;
		required: boolean;
		description: string;
	}[];
	responses: {
		status: number;
		description: string;
		example: Record<string, unknown>;
	}[];
	examples: {
		language: SupportedLanguage;
		code: string;
	}[];
}
