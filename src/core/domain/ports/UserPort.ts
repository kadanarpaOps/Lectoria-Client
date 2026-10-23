import type { RegisterUserRequest } from "../models/users/UserModel";

export interface UserPort {

  registerUser(requestUser: RegisterUserRequest): Promise<void>;

}
