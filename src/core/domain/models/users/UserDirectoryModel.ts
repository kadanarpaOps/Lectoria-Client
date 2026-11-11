export interface UserDirectoryEntry {
  userId: string;
  username: string;
  profileImageUrl: string | null;
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

export interface PublicUserProfile {
  userId: string;
  username: string;
  profileImageUrl: string | null;
  memberSince: string | null;
}
