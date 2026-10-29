import type {
  AdminUsersPageModel,
  UpdateAdminUserRoleRequest,
} from "../../../core/domain/models/admin/AdminModel";
import httpClient from "../config/axios.instance";

export const pageAdminUsersRequest = async (
  pageNumber: number,
  pageSize: number,
  username?: string,
  userEmail?: string,
): Promise<AdminUsersPageModel> => {
  const response = await httpClient.get("auth/admin/users", {
    params: {
      pageNumber,
      pageSize,
      ...(username ? { username } : {}),
      ...(userEmail ? { userEmail } : {}),
    },
  });
  return response.data;
};

export const addAdminUserRoleRequest = async (request: UpdateAdminUserRoleRequest): Promise<void> => {
  await httpClient.patch("auth/admin/add-role", request);
};

export const removeAdminUserRoleRequest = async (request: UpdateAdminUserRoleRequest): Promise<void> => {
  await httpClient.patch("auth/admin/remove-role", request);
};

export const toggleAdminUserStatusRequest = async (userId: string): Promise<void> => {
  await httpClient.patch("auth/admin/toggle-user-status", null, { params: { userId } });
};
