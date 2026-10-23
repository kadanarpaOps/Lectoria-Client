import { registerUserRequest } from "../../infrastructure/api/requests/user.request";
import type { RegisterUserRequest } from "../domain/models/users/UserModel";
import type { UserPort } from "../domain/ports/UserPort";

export class UserService implements UserPort {
  
    async registerUser(registerUser: RegisterUserRequest): Promise<void> {
        const registerData: RegisterUserRequest = registerUser;
        await registerUserRequest(registerData);
    }

}
