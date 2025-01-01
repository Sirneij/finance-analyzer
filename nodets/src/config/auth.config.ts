export const authConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/v1/auth/google/callback",
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: "/api/v1/auth/github/callback",
  },
  session: {
    secret: process.env.SESSION_SECRET || "your-secret-key",
  },
};
