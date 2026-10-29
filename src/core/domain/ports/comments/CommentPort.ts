import type {
  CommentFilters,
  CommentMutationResponse,
  CommentPageResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../../models/comments/CommentModel";

export interface CommentPort {
  createComment(request: CreateCommentRequest): Promise<CommentMutationResponse>;
  getStoryComments(storyId: string, filters: CommentFilters): Promise<CommentPageResponse>;
  getChapterComments(chapterId: string, filters: CommentFilters): Promise<CommentPageResponse>;
  updateComment(commentId: string, request: UpdateCommentRequest): Promise<CommentMutationResponse>;
  deleteComment(commentId: string): Promise<CommentMutationResponse>;
  toggleCommentLike(commentId: string, userId: string): Promise<CommentMutationResponse>;
}
