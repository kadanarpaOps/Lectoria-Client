import type {
  RegisterUserRequest,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  UpdateUsernameRequest,
} from "../../../core/domain/models/users/UserModel";
import type { UserDirectoryPage } from "../../../core/domain/models/users/UserDirectoryModel";
import httpClient from "../config/axios.instance";

export interface UserProfileResponse {
  userId?: string;
  username: string;
  email: string;
  userRoles: string[];
  userDetails: {
    createdAt: string;
    lastUpdatedAt: string;
    registeredVerified: boolean;
    profileImageUrl: string | null;
  };
}

export const registerUserRequest = async (user: RegisterUserRequest): Promise<void> => {
  await httpClient.post("users", user);
};

export const getUserProfileRequest = async (): Promise<UserProfileResponse> => {
  const response = await httpClient.get("auth/user/profile");
  return response.data;
};

export const pageUsersRequest = async (
  pageNumber: number,
  pageSize: number,
  username?: string,
  userEmail?: string,
): Promise<UserDirectoryPage> => {
  const response = await httpClient.get("users", {
    params: {
      pageNumber,
      pageSize,
      ...(username ? { username } : {}),
      ...(userEmail ? { userEmail } : {}),
    },
  });
  return response.data;
};

export const uploadProfileImageRequest = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", image);
  const response = await httpClient.patch("auth/user/profile-image", formData);
  return response.data.profileImageUrl;
};

export const removeProfileImageRequest = async (): Promise<void> => {
  await httpClient.delete("auth/user/profile-image");
};

export const updateUsernameRequest = async (request: UpdateUsernameRequest): Promise<void> => {
  await httpClient.patch("auth/user/info", request);
};

export const updateEmailRequest = async (request: UpdateEmailRequest): Promise<void> => {
  await httpClient.patch("auth/user/change-email", request);
};

export const updatePasswordRequest = async (request: UpdatePasswordRequest): Promise<void> => {
  await httpClient.patch("auth/user/change-password", request);
};

export const disableAccountRequest = async (): Promise<void> => {
  await httpClient.patch("auth/user/disable-account");
};

export const verifyRegistrationRequest = async (username?: string, email?: string): Promise<void> => {
  await httpClient.post("users/verify-registry", null, {
    params: username ? { username } : { email },
  });
};
