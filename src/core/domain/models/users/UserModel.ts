
import type { RolesNames } from "./RoleNames";

interface UserDetails {
  createdAt: Date;
  lastUpdatedAt: Date;
  registeredVerified: boolean;
  profileImageUrl: string;
}

export interface UserModel {
  userId: string;
  username: string;
  email: string;
  userRoles: RolesNames[];
  userDetails: UserDetails;
  userName: string;
  profileImageUrl: string;
  role: { roleName: RolesNames };
}

export interface RegisterUserRequest {
    username: string;
    email: string;
    password: string;
    roleNames: string[];
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

export interface ResetPasswordRequest {
  username?: string;
  userEmail?: string;
  newPassword: string;
}

export type UserInfo = UserModel;
