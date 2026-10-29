import { useCallback, useState, type ReactNode } from "react";
import { CommentService } from "../../../core/use-cases/comments/CommentUseCases";
import type {
  CommentInfo,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../../../core/domain/models/comments/CommentModel";
import { CommentsContext, type CommentsContextType } from "../CommentsContext";
import executeTask from "../utils/TaskExecutor";
import { useAlert } from "../../hooks/useAlert";

const commentService = new CommentService();

function CommentsProvider({ children }: { children: ReactNode }) {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStoryComments: CommentsContextType["getStoryComments"] = useCallback(
    async (storyId, filters) => executeTask(() => commentService.getStoryComments(storyId, filters), setLoading, setError),
    [],
  );

  const getChapterComments: CommentsContextType["getChapterComments"] = useCallback(
    async (chapterId, filters) => executeTask(() => commentService.getChapterComments(chapterId, filters), setLoading, setError),
    [],
  );

  const createComment = async (request: CreateCommentRequest): Promise<CommentInfo | null> => {
    const response = await executeTask(
      () => commentService.createComment(request),
      setLoading,
      setError,
      showAlert,
      true,
    );
    return response?.comment ?? null;
  };

  const updateComment = async (commentId: string, request: UpdateCommentRequest): Promise<CommentInfo | null> => {
    const response = await executeTask(
      () => commentService.updateComment(commentId, request),
      setLoading,
      setError,
      showAlert,
      true,
    );
    return response?.comment ?? null;
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    const response = await executeTask(
      () => commentService.deleteComment(commentId),
      setLoading,
      setError,
      showAlert,
      true,
    );
    return response !== null;
  };

  const toggleCommentLike = async (commentId: string): Promise<CommentInfo | null> => {
    const response = await executeTask(
      () => commentService.toggleCommentLike(commentId),
      setLoading,
      setError,
      showAlert,
      true,
    );
    return response?.comment ?? null;
  };

  const value: CommentsContextType = {
    loading,
    error,
    getStoryComments,
    getChapterComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
  };

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
}

export default CommentsProvider;
