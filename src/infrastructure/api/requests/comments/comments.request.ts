import type {
  CommentFilters,
  CommentMutationResponse,
  CommentPageResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../../../../core/domain/models/comments/CommentModel";
import { storyClient } from "../../config/axios.instance";

export const createCommentRequest = async (
  request: CreateCommentRequest,
): Promise<CommentMutationResponse> => {
  const response = await storyClient.post("api/comment/create", request);
  return response.data;
};

export const getStoryCommentsRequest = async (
  storyId: string,
  filters: CommentFilters,
): Promise<CommentPageResponse> => {
  const response = await storyClient.get(`api/comment/search/story/${storyId}`, { params: filters });
  return response.data;
};

export const getChapterCommentsRequest = async (
  chapterId: string,
  filters: CommentFilters,
): Promise<CommentPageResponse> => {
  const response = await storyClient.get(`api/comment/search/chapter/${chapterId}`, { params: filters });
  return response.data;
};

export const updateCommentRequest = async (
  commentId: string,
  request: UpdateCommentRequest,
): Promise<CommentMutationResponse> => {
  const response = await storyClient.patch(`api/comment/update/${commentId}`, request);
  return response.data;
};

export const deleteCommentRequest = async (commentId: string): Promise<CommentMutationResponse> => {
  const response = await storyClient.delete(`api/comment/${commentId}`);
  return response.data;
};

export const toggleCommentLikeRequest = async (
  commentId: string,
): Promise<CommentMutationResponse> => {
  const response = await storyClient.patch(`api/comment/toggle-like/${commentId}`);
  return response.data;
};
