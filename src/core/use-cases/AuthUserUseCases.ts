import { getUserProfileRequest } from "../../infrastructure/api/requests/user.request";
import type { UserModel } from "../domain/models/users/UserModel";
import type { AuthUserPort } from "../domain/ports/AuthUserPort";

export class AuthUserService implements AuthUserPort {
  
    async getUserProfile(): Promise<UserModel> {
        const profile = await getUserProfileRequest();
        const roleNames = profile.userRoles as UserModel["userRoles"];
        return {
            userId: profile.userId ?? "",
            username: profile.username,
            userName: profile.username,
            email: profile.email,
            userRoles: roleNames,
            role: { roleName: roleNames[0] ?? "LECTORIA_LECTOR" },
            userDetails: {
                ...profile.userDetails,
                createdAt: new Date(profile.userDetails.createdAt),
                lastUpdatedAt: new Date(profile.userDetails.lastUpdatedAt),
                profileImageUrl: profile.userDetails.profileImageUrl ?? "",
            },
            profileImageUrl: profile.userDetails.profileImageUrl ?? "",
        };
    }

}
