import {
  createCommentRequest,
  deleteCommentRequest,
  getChapterCommentsRequest,
  getStoryCommentsRequest,
  toggleCommentLikeRequest,
  updateCommentRequest,
} from "../../../infrastructure/api/requests/comments/comments.request";
import type {
  CommentFilters,
  CommentMutationResponse,
  CommentPageResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../../domain/models/comments/CommentModel";
import type { CommentPort } from "../../domain/ports/comments/CommentPort";

export class CommentService implements CommentPort {
  createComment(request: CreateCommentRequest): Promise<CommentMutationResponse> {
    return createCommentRequest(request);
  }

  getStoryComments(storyId: string, filters: CommentFilters): Promise<CommentPageResponse> {
    return getStoryCommentsRequest(storyId, filters);
  }

  getChapterComments(chapterId: string, filters: CommentFilters): Promise<CommentPageResponse> {
    return getChapterCommentsRequest(chapterId, filters);
  }

  updateComment(commentId: string, request: UpdateCommentRequest): Promise<CommentMutationResponse> {
    return updateCommentRequest(commentId, request);
  }

  deleteComment(commentId: string): Promise<CommentMutationResponse> {
    return deleteCommentRequest(commentId);
  }

  toggleCommentLike(commentId: string): Promise<CommentMutationResponse> {
    return toggleCommentLikeRequest(commentId);
  }
}
