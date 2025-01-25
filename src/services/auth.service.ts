import { User } from "$models/user.model.js";
import { AuthUser, UserProfile } from "$types/auth.types.js";
import { ProviderMismatchError } from "$types/error.types.js";

export class AuthService {
  static async findOrCreateUser(profile: UserProfile) {
    try {
      // First try to find user by email only
      let user = await User.findOne({ email: profile.email }).exec();

      if (user) {
        // User exists, check provider
        if (user.provider !== profile.provider) {
          throw new ProviderMismatchError(user.provider);
        }

        // Check if any details need updating
        const updates: Partial<AuthUser> = {};
        if (user.name !== profile.name) updates.name = profile.name;
        if (user.providerId !== profile.providerId)
          updates.providerId = profile.providerId;
        if (user.avatar !== profile.avatar) updates.avatar = profile.avatar;
        // Check if the user is John Owolabi Idogun via email and name
        if (
          profile.email.toLowerCase() === "sirneij@gmail.com" && // Email check
          profile.name &&
          profile.name.toLowerCase().includes("john owolabi idogun") // Name check
        ) {
          updates.isJohnOwolabiIdogun = true;
        }

        // If updates needed, apply them
        if (Object.keys(updates).length > 0) {
          user = await User.findByIdAndUpdate(
            user._id,
            { $set: updates },
            { new: true }
          ).exec();
        }
      } else {
        // Create new user if none exists
        user = await User.create({
          email: profile.email,
          name: profile.name,
          provider: profile.provider,
          providerId: profile.providerId,
          avatar: profile.avatar,
        });
      }

      return user;
    } catch (error) {
      console.error("Error in findOrCreateUser:", error);
      throw error;
    }
  }
}
