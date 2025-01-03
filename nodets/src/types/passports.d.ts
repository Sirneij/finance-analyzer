import { AuthUser } from "$types/auth.types.ts";

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// Re-export the User type
export type User = Express.User;
