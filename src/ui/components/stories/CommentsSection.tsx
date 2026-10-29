import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Heart, Pencil, Send, Trash2, X } from "lucide-react";
import type { CommentInfo, CommentPageResponse } from "../../../core/domain/models/comments/CommentModel";
import { useAuth } from "../../hooks/useAuth";
import { useComments } from "../../hooks/useComments";

type Props = {
  storyId?: string;
  chapterId?: string;
  title?: string;
};

const pageSize = 10;

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

const CommentsSection = ({ storyId, chapterId, title = "Opiniones de lectores" }: Props) => {
  const { authUser } = useAuth();
  const {
    loading,
    error,
    getStoryComments,
    getChapterComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
  } = useComments();
  const [page, setPage] = useState<CommentPageResponse | null>(null);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (offset: number, append = false) => {
    const filters = { offset, limit: pageSize };
    const response = storyId
      ? await getStoryComments(storyId, filters)
      : chapterId
        ? await getChapterComments(chapterId, filters)
        : null;
    if (!response) return;
    setPage((current) => append && current
      ? { ...response, data: [...current.data, ...response.data] }
      : response);
  }, [chapterId, getChapterComments, getStoryComments, storyId]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPage(0); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPage]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    const comment = await createComment({
      content: trimmed,
      ...(storyId ? { storyId } : {}),
      ...(chapterId ? { chapterId } : {}),
    });
    if (!comment) return;
    setContent("");
    await loadPage(0);
  };

  const saveEdit = async (commentId: string) => {
    const updated = await updateComment(commentId, { content: editingContent.trim() });
    if (!updated) return;
    setPage((current) => current && ({
      ...current,
      data: current.data.map((comment) => comment.id === updated.id ? updated : comment),
    }));
    setEditingId(null);
    setEditingContent("");
  };

  const removeComment = async (commentId: string) => {
    if (!window.confirm("¿Quieres eliminar este comentario?")) return;
    if (await deleteComment(commentId)) {
      setPage((current) => current && ({
        ...current,
        data: current.data.filter((comment) => comment.id !== commentId),
        meta: { ...current.meta, totalItems: Math.max(0, current.meta.totalItems - 1) },
      }));
    }
  };

  const likeComment = async (comment: CommentInfo) => {
    const updated = await toggleCommentLike(comment.id);
    if (updated) {
      setPage((current) => current && ({
        ...current,
        data: current.data.map((item) => item.id === updated.id ? updated : item),
      }));
    }
  };

  const loadMore = async () => {
    if (!page || loadingMore) return;
    setLoadingMore(true);
    await loadPage(page.data.length, true);
    setLoadingMore(false);
  };

  return (
    <section className="space-y-6" aria-labelledby="comments-heading">
      <div className="flex items-center gap-3">
        <h3 id="comments-heading" className="text-xl sm:text-2xl font-headline font-bold text-on-surface">
          {title}
        </h3>
        <div className="flex-1 h-px bg-outline-variant/10" />
      </div>

      {authUser ? (
        <form onSubmit={submitComment} className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-outline-variant/5">
          <label htmlFor="new-comment" className="sr-only">Escribe un comentario</label>
          <textarea
            id="new-comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full bg-surface-container-lowest rounded-2xl p-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 min-h-25 resize-y focus:outline-none"
            placeholder="Escribe tus pensamientos..."
            maxLength={5000}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-primary text-on-primary px-5 py-2 rounded-full font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
            >
              <Send size={16} />
              Publicar
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
          Inicia sesión para participar en la conversación.
        </p>
      )}

      {error && <p role="alert" className="text-sm text-error">{error}</p>}

      <div className="space-y-4">
        {page?.data.map((comment) => {
          const isAuthor = authUser?.userId === comment.userId;
          const authorName = isAuthor ? authUser.userName : comment.username;
          const avatar = isAuthor ? authUser.profileImageUrl : "";
          return (
            <article key={comment.id} className="flex gap-3 sm:gap-4 min-w-0">
              {avatar ? (
                <img src={avatar} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div aria-hidden="true" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold shrink-0">
                  {authorName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1 bg-surface-container-low/50 rounded-2xl p-4 sm:p-5 border border-outline-variant/5">
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 mb-2">
                  <h4 className="font-bold text-on-surface break-all">{authorName}</h4>
                  <time className="text-xs text-on-surface-variant" dateTime={comment.createdAt}>
                    {formatDate(comment.createdAt)}
                  </time>
                </div>
                {editingId === comment.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(event) => setEditingContent(event.target.value)}
                      className="w-full rounded-xl bg-surface-container-lowest p-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30 resize-y"
                      maxLength={5000}
                      autoFocus
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => setEditingId(null)} className="px-3 py-2 rounded-lg text-sm hover:bg-surface-container-high cursor-pointer inline-flex items-center gap-1">
                        <X size={15} /> Cancelar
                      </button>
                      <button type="button" onClick={() => void saveEdit(comment.id)} disabled={loading || !editingContent.trim()} className="px-3 py-2 rounded-lg bg-primary text-on-primary text-sm disabled:opacity-50 cursor-pointer">
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={() => void likeComment(comment)} disabled={loading || !authUser} className="text-sm text-on-surface-variant hover:text-primary disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer">
                    <Heart size={16} /> {comment.likes}
                  </button>
                  {isAuthor && editingId !== comment.id && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingId(comment.id); setEditingContent(comment.content); }} aria-label="Editar comentario" className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary cursor-pointer">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => void removeComment(comment.id)} aria-label="Eliminar comentario" disabled={loading} className="p-2 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error disabled:opacity-50 cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!loading && page && page.data.length === 0 && (
          <p className="text-center text-on-surface-variant py-6">Todavía no hay comentarios. ¡Sé la primera persona en comentar!</p>
        )}
        {!page && loading && <div className="flex justify-center py-6"><div className="loading-button" /></div>}
      </div>

      {page && page.data.length < page.meta.totalItems && (
        <div className="flex justify-center">
          <button type="button" onClick={() => void loadMore()} disabled={loading || loadingMore} className="rounded-xl px-5 py-2 border border-outline-variant/20 text-on-surface hover:bg-surface-container-high disabled:opacity-50 cursor-pointer">
            {loadingMore ? "Cargando..." : "Ver más comentarios"}
          </button>
        </div>
      )}
    </section>
  );
};

export default CommentsSection;
