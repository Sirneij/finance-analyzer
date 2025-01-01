import { User } from "$models/user.model.ts";
import { UserProfile } from "$types/auth.types.ts";

export class AuthService {
  static async findOrCreateUser(profile: UserProfile) {
    const user = await User.findOne({
      email: profile.email,
      provider: profile.provider,
      providerId: profile.id,
    });

    if (user) {
      return user;
    }

    return await User.create({
      email: profile.email,
      name: profile.name,
      provider: profile.provider,
      providerId: profile.id,
      avatar: profile.avatar,
    });
  }
}
