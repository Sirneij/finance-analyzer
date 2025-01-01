export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  provider: "google" | "github";
  providerId: string;
  avatar: string | null;
}

export interface AuthUser {
  _id?: string;
  email: string;
  name?: string;
  provider: string;
  providerId: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}
