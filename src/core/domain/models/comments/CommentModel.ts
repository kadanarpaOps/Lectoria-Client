import type { PageResponse } from "../common/PaginationModels";

export interface CommentInfo {
  id: string;
  username: string;
  userId: string;
  content: string;
  likes: number;
  storyId: string | null;
  chapterId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CommentFilters {
  offset: number;
  limit: number;
}

export interface CreateCommentRequest {
  username: string;
  userId: string;
  content: string;
  storyId?: string;
  chapterId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export type CommentPageResponse = PageResponse<CommentInfo>;

export interface CommentMutationResponse {
  message: string;
  comment: CommentInfo;
}
