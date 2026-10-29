import {
  disableAccountRequest,
  pageUsersRequest,
  registerUserRequest,
  removeProfileImageRequest,
  uploadProfileImageRequest,
  updateEmailRequest,
  updatePasswordRequest,
  updateUsernameRequest,
} from "../../infrastructure/api/requests/user.request";
import type { RegisterUserRequest } from "../domain/models/users/UserModel";
import type { UserPort } from "../domain/ports/UserPort";
import type { UserDirectoryPage } from "../domain/models/users/UserDirectoryModel";
import type { UpdateEmailRequest, UpdatePasswordRequest, UpdateUsernameRequest } from "../domain/models/users/UserModel";

export class UserService implements UserPort {
  async registerUser(registerUser: RegisterUserRequest): Promise<void> {
    await registerUserRequest(registerUser);
  }

  async pageUsers(pageNumber: number, pageSize: number, username?: string, userEmail?: string): Promise<UserDirectoryPage> {
    return pageUsersRequest(pageNumber, pageSize, username, userEmail);
  }

  async updateUsername(request: UpdateUsernameRequest): Promise<void> {
    await updateUsernameRequest(request);
  }

  async updateEmail(request: UpdateEmailRequest): Promise<void> {
    await updateEmailRequest(request);
  }

  async updatePassword(request: UpdatePasswordRequest): Promise<void> {
    await updatePasswordRequest(request);
  }

  async disableAccount(): Promise<void> {
    await disableAccountRequest();
  }

  async uploadProfileImage(image: File): Promise<string> {
    return uploadProfileImageRequest(image);
  }

  async removeProfileImage(): Promise<void> {
    await removeProfileImageRequest();
  }

}
