export interface UserDirectoryEntry {
  userId: string;
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

export interface UserDirectoryPage {
  data: UserDirectoryEntry[];
  metaData: {
    numberPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
