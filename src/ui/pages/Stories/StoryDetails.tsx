import { useNavigate, useParams } from "react-router"
import { useStories } from "../../hooks/useStories";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import type { StoryInfo } from "../../../core/domain/models/stories/StoryModel";
import { getRandomCover } from "../utils/covers.util";
import { Bookmark, BookOpen, ChevronLeft, ChevronRight, Clock, Info, List, MessageSquareText, Pencil, UserRoundPlus } from "lucide-react";
import { useChapters } from "../../hooks/useChapters";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import type { ChapterInfo } from "../../../core/domain/models/chapters/ChapterModel";
import { countTotalWords, parseTiptapContent, renderWithoutFormat } from "../utils/renderTiptap.util";
import { getLastModifiedTime } from "../utils/time.util";
import CommentsSection from "../../components/stories/CommentsSection";
import { createCoauthorRequest, getCoauthoredStories } from "../../../infrastructure/api/requests/requests.request";

const CHAPTERS_PER_PAGE = 5;

const StoryDetails = () => {

  // Use Navigate
  const navigate = useNavigate();
  // Use Auth
  const { authUser } = useAuth();
  // Use Stories
  const { loadStoryById, addToFavorites, removeFromFavorites, existsFromFavorites } = useStories();
  // Use Chapters
  const { getChaptersByStory } = useChapters();
  // Extract storyId from the URI
  const { storyId } = useParams<{ storyId: string}>();
  // Find Story Details
  const [ story, setStory ] = useState<StoryInfo | null>(null);
  const [ favorite, setFavorite ] = useState<boolean>(false);
  const [ chapters, setChapters ] = useState<PageResponse<ChapterInfo> | null>(null);
  const [ totalItemsChapters, setTotalChaptersItems ] = useState<number | null>(null)
  const [ chapterPage, setChapterPage ] = useState(0);
  const [ chapterReloadKey, setChapterReloadKey ] = useState(0);
  const [ chaptersLoading, setChaptersLoading ] = useState(false);
  const [ chaptersError, setChaptersError ] = useState<string | null>(null);
  const [ coauthorRequestSent, setCoauthorRequestSent ] = useState(false);
  const [ coauthorRequestError, setCoauthorRequestError ] = useState<string | null>(null);
  const [ isCoauthor, setIsCoauthor ] = useState(false);
  const [ coauthorStatusLoaded, setCoauthorStatusLoaded ] = useState(false);
  const currentStoryIdRef = useRef<string | null>(null);
  const isOwnStory = Boolean(authUser && story?.userId === authUser.userId);

  useEffect(() => {
    let active = true;
    const loadStory = async () => {
      if (storyId) {
        const responseStory = await loadStoryById(storyId);
        if (!active) return;
        if (responseStory === null) {
          navigate("*");
          return;
        }
        setStory(responseStory);
        if (currentStoryIdRef.current !== responseStory.id) {
          currentStoryIdRef.current = responseStory.id;
          setChapterPage(0);
          setTotalChaptersItems(null);
        }
        if (authUser && responseStory.userId !== authUser.userId) {
          setCoauthorStatusLoaded(false);
          void getCoauthoredStories().then((coauthoredStories) => {
            if (!active) return;
            setIsCoauthor(coauthoredStories.some((coauthoredStory) => coauthoredStory.id === responseStory.id));
            setCoauthorStatusLoaded(true);
          }).catch(() => {
            if (active) setIsCoauthor(true);
          });
        } else {
          setIsCoauthor(false);
          setCoauthorStatusLoaded(true);
        }
        if (authUser && responseStory.userId !== authUser.userId) {
          void existsFromFavorites(responseStory.id).then((responseFavorite) => {
            if (active) setFavorite(responseFavorite);
          }).catch(() => {
            if (active) setFavorite(false);
          });
        } else {
          setFavorite(false);
        }
      }
    };
    void loadStory();
    return () => { active = false; };
  }, [storyId, loadStoryById, navigate, authUser, existsFromFavorites]);

  useEffect(() => {
    let active = true;
    if (!storyId) return;
    void Promise.resolve().then(() => {
      if (!active) return null;
      setChaptersLoading(true);
      setChaptersError(null);
      setChapters(null);
      return getChaptersByStory({
        offset: chapterPage * CHAPTERS_PER_PAGE,
        limit: CHAPTERS_PER_PAGE,
        newestFirst: false,
      }, storyId);
    }).then((responseChapters) => {
      if (!active) return;
      if (!responseChapters) {
        setChaptersError("No se pudieron cargar los capítulos públicos.");
        return;
      }
      setTotalChaptersItems(responseChapters.meta.totalItems);
      setChapters(responseChapters);
    }).catch(() => {
      if (active) setChaptersError("No se pudieron cargar los capítulos públicos.");
    }).finally(() => {
      if (active) setChaptersLoading(false);
    });
    return () => { active = false; };
  }, [storyId, chapterPage, chapterReloadKey, getChaptersByStory]);

  // Favorite Details
  const handleAddFavorite = async (storyId: string) => {
    const success = await addToFavorites(storyId);
    if (success) {
      const responseFavorite = await existsFromFavorites(storyId);
      setFavorite(responseFavorite);
    }
  }
  const handleRemoveFavorite = async (storyId: string) => {
    const success = await removeFromFavorites(storyId);
    if (success) {
      const responseFavorite = await existsFromFavorites(storyId);
      setFavorite(responseFavorite);
    }
  }
  const handleCoauthorRequest = async () => {
    if (!story) return;
    try {
      await createCoauthorRequest(story.id);
      setCoauthorRequestSent(true);
      setCoauthorRequestError(null);
    } catch {
      setCoauthorRequestError("No se pudo enviar la solicitud. Puede que ya exista una pendiente.");
    }
  };

  return (
    <main className="relative h-full">
      { story ? (
        <div className="p-4 sm:p-8 lg:p-12 xl:px-30 max-w-7xl mx-auto w-full">
          <section className="relative mb-16" id="info">
            <div className="flex flex-col lg:flex-row gap-7 sm:gap-12 items-start">
              <div className="w-full lg:w-72 shrink-0 group relative">
                <div className="aspect-2/3 w-full bg-surface-container-high rounded-xl overflow-hidden shadow-2xl relative">
                  <img
                    src={`${story.coverUrl ? story.coverUrl : getRandomCover()}`}
                    alt="Portada de Historia"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-surface/80 via-transparent to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -right-6 font-headline font-extrabold text-4xl text-on-surface/30 pointer-events-none select-none">
                  {story.status.replace("_"," ")}
                </div>
              </div>
              {/** Story Info */}
              <div className="flex-1 space-y-6 pt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    {story.genre.name}
                  </span>
                  <span className="bg-secondary-container/20 text-secondary px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    {story.secondaryGenre.name}
                  </span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tighter text-on-surface leading-[1.1] break-words">
                  {story.title}
                </h2>
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <Pencil size={20} fill="currentColor" />
                    </span>
                    <span className="text-md font-medium">
                      {isOwnStory ? "Tu historia" : story.username}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-outline-variant/30 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <Clock size={20} />
                    </span>
                    <span className="text-sm">
                      {story.updatedAt || story.lastActivityAt
                        ? `Última modificación: ${getLastModifiedTime(story.updatedAt ?? story.lastActivityAt)}`
                        : `Publicada: ${getLastModifiedTime(story.createdAt)}`}
                    </span>
                  </div>
                </div>
                <p className="text-lg text-on-surface-variant/80 max-w-2xl leading-relaxed italic border-l-2 border-primary/20 pl-6">
                  {story.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="bg-primary-container text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer">
                    <span>
                      <BookOpen size={20} strokeWidth={3} />
                    </span>
                    Comenzar
                  </button>
                  { authUser && !isOwnStory && coauthorStatusLoaded && !isCoauthor && (
                      <button
                        onClick={() => !favorite ? handleAddFavorite(story.id) : handleRemoveFavorite(story.id)}
                        className="border border-outline-variant/30 bg-surface-container-low text-on-surface px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container-high transition-all cursor-pointer"
                      >
                        <span>
                          <Bookmark size={20} strokeWidth={3} fill={`${ !favorite ? "transparent" : "currentColor" }`} />
                        </span>
                        { !favorite ? "Guardar" : "Eliminar"}
                      </button>
                  )}
                  { authUser && !isOwnStory && (
                    <button
                      type="button"
                      disabled={coauthorRequestSent}
                      onClick={() => void handleCoauthorRequest()}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary/30 bg-surface-container-low px-5 py-3 font-bold text-on-surface transition hover:bg-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <UserRoundPlus size={19} />
                      {coauthorRequestSent ? "Solicitud enviada" : "Solicitar coautoría"}
                    </button>
                  )}
                </div>
                {coauthorRequestError && <p role="alert" className="pt-2 text-sm text-red-400">{coauthorRequestError}</p>}
              </div>
              {/** Page Navigation */}
              <nav className="hidden xl:flex flex-col gap-2 p-2 bg-surface-container-high/40 rounded-2xl sticky top-24 border border-outline-variant/5">
                <a href="#info" className="p-4 rounded-xl text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:shadow-lg hover:shadow-primary-container/10 transition-all" title="Basic Info">
                  <Info size={20} />
                </a>
                <a href="#chapters" className="p-4 rounded-xl text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:shadow-lg hover:shadow-primary-container/10 transition-all" title="Chapters">
                  <List size={20} />
                </a>
                <a href="#comments" className="p-4 rounded-xl text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:shadow-lg hover:shadow-primary-container/10 transition-all" title="Comments">
                  <MessageSquareText size={20} />
                </a>
              </nav>
            </div>
          </section>

          {/** Chapters List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-12">
              <section className="bg-surface-container-low/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-outline-variant/5" id="chapters">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6 sm:mb-8">
                  <h3 className="text-2xl font-headline font-bold text-on-surface">
                    Capítulos
                  </h3>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1 rounded-full">
                    {totalItemsChapters} Capítulos
                  </span>
                </div>
              
                {/** Load more chapters */}
              <div className="grid gap-4">
              {chaptersLoading ? (
                <div className="flex items-center justify-center py-10"><div className="loading-button" /></div>
              ) : chaptersError ? (
                <div className="rounded-xl border border-red-400/20 bg-red-500/5 p-5 text-center">
                  <p role="alert" className="text-sm text-red-300">{chaptersError}</p>
                  <button type="button" onClick={() => setChapterReloadKey((current) => current + 1)} className="mt-3 cursor-pointer text-sm font-semibold text-high-enfasis hover:underline">
                    Reintentar
                  </button>
                </div>
              ) : chapters && chapters.data.length > 0 ? (
                chapters.data.map(chapter => (
                  <button
                    type="button"
                    onClick={() => navigate("/read", {
                      state: { chapterToRead: chapter, storyTitle: story.title, storyAuthor: story.username }
                    })}
                    key={chapter.id} className="group flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border border-transparent bg-surface-container-low p-4 text-left transition-all hover:border-primary/20 sm:items-center sm:p-6"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-6 min-w-0">
                      <span className="text-xl sm:text-2xl font-display font-black text-on-surface-variant/50 italic shrink-0">
                        {String(chapter.order).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h4 className={`text-base sm:text-lg break-words ${chapter.title ? "font-bold text-on-surface group-hover:text-primary transition-colors" : "font-light text-on-surface-variant/40 italic"}`}>
                          {renderWithoutFormat(parseTiptapContent(chapter.title))}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          Publicado • Última Edición {chapter.updatedAt ? getLastModifiedTime(chapter.updatedAt) : "Nunca"} • {chapter.content ? countTotalWords(parseTiptapContent(chapter.content)) : 0} palabras
                        </p>
                      </div>
                    </div>
                    <BookOpen className="mt-1 shrink-0 text-primary transition-transform group-hover:translate-x-1 sm:mt-0" size={20} />
                  </button>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-outline-variant/30 px-5 py-8 text-center text-on-surface-variant">
                  Esta historia aún no tiene capítulos públicos.
                </p>
              )}
            </div>
            {chapters && chapters.meta.totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Paginación de capítulos">
                <button type="button" disabled={chapterPage === 0 || chaptersLoading} onClick={() => setChapterPage((current) => Math.max(0, current - 1))}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-surface-container-high px-3 py-2 text-sm text-on-surface transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4">
                  <ChevronLeft size={18} /> Anterior
                </button>
                <span className="text-xs text-on-surface-variant sm:text-sm">Página {chapterPage + 1} de {chapters.meta.totalPages}</span>
                <button type="button" disabled={chapterPage + 1 >= chapters.meta.totalPages || chaptersLoading} onClick={() => setChapterPage((current) => current + 1)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-surface-container-high px-3 py-2 text-sm text-on-surface transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4">
                  Siguiente <ChevronRight size={18} />
                </button>
              </nav>
            )}

              </section>
              {/** Comments */}
              <div id="comments">
                {story && <CommentsSection key={story.id} storyId={story.id} />}
              </div>
            </div>
            {/** Story Metadata */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant/10 shadow-xl overflow-hidden relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
                <h4 className="text-lg uppercase tracking-widest text-primary font-bold mb-6">
                  Datos
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-3xl font-headline font-bold">{story.totalViews}</p>
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-tighter">Lecturas Totales</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-headline font-bold">{story.ratingSum}</p>
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-tighter">Estrellas Totales</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-headline font-bold">{story.totalRating}</p>
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-tighter">Calificación</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-headline font-bold">{story.totalFavorites}</p>
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-tighter">Guardados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="loading-button" />
        </div>
      )}
    </main>
  )
}

export default StoryDetails
