
import type { RolesNames } from "./RoleNames";

interface UserDetails {
  createdAt: Date;
  lastUpdatedAt: Date;
  registeredVerified: boolean;
  profileImageUrl: string;
}

export interface UserModel {
  username: string;
  email: string;
  userRoles: RolesNames[];
  userDetails: UserDetails;
}

export interface RegisterUserRequest {
    username: string;
    email: string;
    password: string;
    roleNames: RolesNames[];
}

export interface UpdateUsernameRequest {
  newUsername: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}
