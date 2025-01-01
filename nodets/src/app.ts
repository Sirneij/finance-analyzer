import express, { Application } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { connectToCluster } from "$services/db.service.ts";
import { authConfig } from "$config/auth.config.ts";
import { AuthService } from "$services/auth.service.ts";
import authRoutes from "$routes/auth.routes.ts";

const app: Application = express();

app.use(express.json());
app.use(
  session({
    secret: authConfig.session.secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    authConfig.google,
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(`Google profile: ${JSON.stringify(profile)}`);

        const user = await AuthService.findOrCreateUser({
          id: profile.id,
          email: profile.emails![0].value,
          name: profile.displayName,
          provider: "google",
          providerId: profile.id,
          avatar: profile.photos![0].value,
        });
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    authConfig.github,
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        console.log(`GitHub profile: ${JSON.stringify(profile)}`);
        const user = await AuthService.findOrCreateUser({
          id: profile.id,
          email: profile.emails![0].value,
          provider: "github",
          providerId: profile.id,
          avatar: profile.photos![0].value,
          name: profile.username,
        });
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

app.use("/api/v1/auth", authRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

const startServer = async () => {
  try {
    await connectToCluster();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
