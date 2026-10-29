import {
  addAdminUserRoleRequest,
  pageAdminUsersRequest,
  removeAdminUserRoleRequest,
  toggleAdminUserStatusRequest,
} from "../../infrastructure/api/requests/admin.request";
import type {
  AdminUsersPageModel,
  UpdateAdminUserRoleRequest,
} from "../domain/models/admin/AdminModel";

export class AdminService {
  async pageUsers(
    pageNumber: number,
    pageSize: number,
    username?: string,
    userEmail?: string,
  ): Promise<AdminUsersPageModel> {
    return pageAdminUsersRequest(pageNumber, pageSize, username, userEmail);
  }

  async addRole(request: UpdateAdminUserRoleRequest): Promise<void> {
    await addAdminUserRoleRequest(request);
  }

  async removeRole(request: UpdateAdminUserRoleRequest): Promise<void> {
    await removeAdminUserRoleRequest(request);
  }

  async toggleUserStatus(userId: string): Promise<void> {
    await toggleAdminUserStatusRequest(userId);
  }
}
