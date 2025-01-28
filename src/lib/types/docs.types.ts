export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type SupportedLanguage = 'nodejs' | 'python' | 'go' | 'rust';

export interface Endpoint {
	path: string;
	method: HttpMethod;
	middlewares: string[];
	category: string;
	description: string;
	parameters?: Parameter[];
	responses: {
		status: number;
		description: string;
		example: Record<string, unknown>;
	}[];
	examples: ExampleCode[];
}

export interface FormState {
	path: string;
	method: HttpMethod;
	middlewares: string[];
	category: string;
	description: string;
	parameters?: Parameter[];
	responses: Response[];
	examples: ExampleCode[];
}

export interface CodeExample {
	language: SupportedLanguage;
	code: string;
}

export interface ApiDoc {
	_id: string;
	path: string;
	method: HttpMethod;
	middlewares: string[];
	category: string;
	description: string;
	responses: Array<{
		status: number;
		description: string;
		example: string;
		_id: string;
	}>;
	examples: Array<{
		language: string;
		code: string;
		_id: string;
	}>;
	parameters: Parameter[];
	createdAt: string;
	updatedAt: string;
}

export interface Parameter {
	name: string;
	type: string;
	required: boolean;
	description: string;
}

export interface Response {
	status: number;
	description: string;
	example: Record<string, unknown> | string;
}

export interface ExampleCode {
	language: SupportedLanguage;
	code: string;
}
