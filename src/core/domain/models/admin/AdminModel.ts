export interface AdminUserModel {
  userId: string;
  username: string;
  email: string;
  userRoles: string[];
  isEnabled: boolean;
  userDetails: {
    createdAt: string;
    lastUpdatedAt: string;
    registeredVerified: boolean;
    profileImageUrl: string | null;
  };
}

export interface AdminUsersPageModel {
  data: AdminUserModel[];
  metaData: {
    numberPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UpdateAdminUserRoleRequest {
  userId: string;
  role: string;
}
