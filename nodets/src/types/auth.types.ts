import mongoose from "mongoose";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  provider: "google" | "github";
  providerId: number;
  avatar: string | null;
}

export interface AuthUser {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  provider: string;
  providerId: number;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthCredentials {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface AuthConfig {
  google: OAuthCredentials;
  github: OAuthCredentials;
  session: {
    secret: string;
  };
}

interface GitHubEmail {
  value: string;
}

interface GitHubPhoto {
  value: string;
}

export interface GitHubProfile {
  id: string;
  nodeId: string;
  displayName: string;
  username: string;
  profileUrl: string;
  emails: GitHubEmail[];
  photos: GitHubPhoto[];
  provider: "github";
  _raw: string;
  _json: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
    name: string;
    email: string;
    bio: string;
    location: string;
    created_at: string;
    updated_at: string;
    public_repos: number;
    followers: number;
    following: number;
  };
}
