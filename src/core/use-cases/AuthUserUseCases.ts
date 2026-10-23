import { getUserProfileRequest } from "../../infrastructure/api/requests/auth.users.request";
import type { UserModel } from "../domain/models/users/UserModel";
import type { AuthUserPort } from "../domain/ports/AuthUserPort";

export class AuthUserService implements AuthUserPort {
  
    async getUserProfile(): Promise<UserModel> {
        const profileResponse = await getUserProfileRequest();
        return profileResponse;
    }

}
