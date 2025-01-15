import { AuthUser } from "$types/auth.types.js";

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// Re-export the User type
export type User = Express.User;
