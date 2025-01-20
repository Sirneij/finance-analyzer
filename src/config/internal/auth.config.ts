import { AuthConfig } from "$types/auth.types.js";
import { config } from "dotenv";

config();

export const authConfig: AuthConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.APP_URL}/api/v1/auth/google/callback`,
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: `${process.env.APP_URL}/api/v1/auth/github/callback`,
  },
  session: {
    secret: process.env.SESSION_SECRET || "your-secret-key",
  },
};
