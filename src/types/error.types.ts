export enum AuthErrorType {
  PROVIDER_MISMATCH = "PROVIDER_MISMATCH",
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
}

export class AuthError extends Error {
  constructor(
    public readonly type: AuthErrorType,
    public readonly statusCode: number = 401,
    public readonly provider?: string
  ) {
    super(provider ? `Please login with ${provider}` : "Authentication failed");
    this.name = "AuthError";
  }
}

export class ProviderMismatchError extends AuthError {
  constructor(provider: string) {
    super(AuthErrorType.PROVIDER_MISMATCH, 401, provider);
    this.name = "ProviderMismatchError";
  }
}
