import type { RegisterUserRequest } from "../models/users/UserModel";
import type { UserDirectoryPage } from "../models/users/UserDirectoryModel";

export interface UserPort {

  registerUser(requestUser: RegisterUserRequest): Promise<void>;

  pageUsers(pageNumber: number, pageSize: number, username?: string, userEmail?: string): Promise<UserDirectoryPage>;

}
