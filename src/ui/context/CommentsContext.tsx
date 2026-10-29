import { createContext } from "react";
import type {
  CommentFilters,
  CommentInfo,
  CommentPageResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../../core/domain/models/comments/CommentModel";

export interface CommentsContextType {
  loading: boolean;
  error: string | null;
  getStoryComments: (storyId: string, filters: CommentFilters) => Promise<CommentPageResponse | null>;
  getChapterComments: (chapterId: string, filters: CommentFilters) => Promise<CommentPageResponse | null>;
  createComment: (request: CreateCommentRequest) => Promise<CommentInfo | null>;
  updateComment: (commentId: string, request: UpdateCommentRequest) => Promise<CommentInfo | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  toggleCommentLike: (commentId: string) => Promise<CommentInfo | null>;
}

export const CommentsContext = createContext<CommentsContextType | null>(null);
