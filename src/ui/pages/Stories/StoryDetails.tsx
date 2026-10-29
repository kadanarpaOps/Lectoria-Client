import { useNavigate, useParams } from "react-router"
import { useStories } from "../../hooks/useStories";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import type { StoryInfo } from "../../../core/domain/models/stories/StoryModel";
import { getRandomCover } from "../utils/covers.util";
import { Bookmark, BookOpen, Clock, Info, List, MessageSquareText, Pencil } from "lucide-react";
import { useChapters } from "../../hooks/useChapters";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import type { ChapterInfo } from "../../../core/domain/models/chapters/ChapterModel";
import { countTotalWords, renderWithoutFormat } from "../utils/renderTiptap.util";
import { getLastModifiedTime } from "../utils/time.util";

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

  useEffect(() => {
    const loadStory = async () => {
      if (storyId) {
        const responseStory = await loadStoryById(storyId);
        if (responseStory === null) {
          navigate("*");
        }
        setStory(responseStory);
        if (authUser?.userId) {
          const responseFavorite = await existsFromFavorites(authUser.userId, responseStory.id);
          setFavorite(responseFavorite);
        }

        const responseChapters = await getChaptersByStory({offset: 1, limit: 5, newestFirst: true}, responseStory.id);
        const totalChapters = responseChapters.meta.totalItems;
        setTotalChaptersItems(totalChapters);
        setChapters(responseChapters);
      }
    };
    loadStory();
  }, [storyId, loadStoryById, navigate, authUser, getChaptersByStory, existsFromFavorites]);

  // Favorite Details
  const handleAddFavorite = async (userId: string, storyId: string) => {
    const success = await addToFavorites(userId, storyId);
    if (success) {
      const responseFavorite = await existsFromFavorites(userId, storyId);
      setFavorite(responseFavorite);
    }
  }
  const handleRemoveFavorite = async (userId: string, storyId: string) => {
    const success = await removeFromFavorites(userId, storyId);
    if (success) {
      const responseFavorite = await existsFromFavorites(userId, storyId);
      setFavorite(responseFavorite);
    }
  }

  return (
    <main className="relative h-full">
      { story ? (
        <div className="p-8 md:p-12 md:px-30 max-w-7xl mx-auto w-full">
          <section className="relative mb-16" id="info">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
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
                <h2 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter text-on-surface leading-[1.1]">
                  {story.title}
                </h2>
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <Pencil size={20} fill="currentColor" />
                    </span>
                    <span
                      className="text-md font-medium"
                    >
                      Lectoria
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-outline-variant/30 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <Clock size={20} />
                    </span>
                    <span className="text-sm">
                      {story.updatedAt !== null ? (
                        "No se ha modificado"
                      ) : (
                        `Última modificación ${new Date(story.createdAt.toLocaleString()).toLocaleString()}`
                      )}
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
                  { authUser?.userId && (
                    authUser.userId !== story.userId && (
                      <button
                        onClick={() => !favorite ? handleAddFavorite(authUser.userId, story.id) : handleRemoveFavorite(authUser.userId, story.id)}
                        className="border border-outline-variant/30 bg-surface-container-low text-on-surface px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container-high transition-all cursor-pointer"
                      >
                        <span>
                          <Bookmark size={20} strokeWidth={3} fill={`${ !favorite ? "transparent" : "currentColor" }`} />
                        </span>
                        { !favorite ? "Guardar" : "Eliminar"}
                      </button>
                    )
                  )}
                </div>
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
              <section className="bg-surface-container-low/30 rounded-3xl p-8 border border-outline-variant/5" id="chapters">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-headline font-bold text-on-surface">
                    Capítulos
                  </h3>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1 rounded-full">
                    {totalItemsChapters} Capítulos
                  </span>
                </div>
              
                {/** Load more chapters */}
              <div className="grid gap-4">
              { chapters && chapters.data.length > 0 ? (
                chapters.data.map(chapter => (
                  <div
                    onClick={() => navigate("/read", {
                      state: { chapterToRead: chapter }
                    })}
                    key={chapter.id} className="group flex items-center justify-between p-6 rounded-2xl bg-surface-container-low border border-transparent hover:border-primary/20 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-display font-black text-on-surface-variant/50 italic">
                        {String(chapter.order).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className={`text-lg ${chapter.title ? "font-bold text-on-surface group-hover:text-primary transition-colors" : "font-light text-on-surface-variant/40 italic"}`}>
                          {renderWithoutFormat(JSON.parse(chapter.title))}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {chapter.hidden ? "Borrador" : "Publicado"} • Última Edición {chapter.updatedAt ? getLastModifiedTime(chapter.updatedAt) : "Nunca"} • {chapter.content ? (chapter.content.trim().length > 0 && countTotalWords(JSON.parse(chapter.content))) : 0} palabras
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !chapters ? (
                  <h3 className="text-2xl text-center pt-6 font-bold">
                    No has creado ningún capítulo
                  </h3>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="loading-button" />
                  </div>
                )
              )}
            </div>


              </section>
              {/** Comments */}
              <section className="space-y-8" id="comments">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-headline font-bold text-on-surface">
                    Opiniones de Lectores
                  </h3>
                  <div className="flex-1 h-px bg-outline-variant/10"> </div>
                </div>
                { authUser && (
                  <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/5">
                    <textarea
                      className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 min-h-25 resize-none mb-4 focus:outline-none"
                      placeholder="Escribe tus pensamientos..."
                    >
                    </textarea>
                    <div className="flex justify-end items-center">
                      <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform cursor-pointer">
                        Publicar
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAViHy49kRFM-I-4243T5qCLN9P6g39st7Ga3crtZ9EIwL6eXENC7s3EmTswArbc0Ib-Cv_WLjgk2Iosff-dDwh0t4ru4WYcaDneUrMJLdk34gpq8wdV9rJQLnArmfxpoXwLZuoxleVoKCMSVrgz-0eF4hf5RvL324VPJ4mFu9p1cMg7sBbF-1sSYt9DK5KoboTR0p1-RA_sC2pWBdvEsleMHR33a89ETxr1K6CDUX-UeVYKWjJ55V9PAaqp_B7vxzd7KqR8MF2U0Q"
                      alt="Imágen de Perfil"
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 bg-surface-container-low/40 rounded-2xl p-5 border border-outline-variant/5">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-bold text-on-surface">
                          NombreUsuario
                        </h5>
                        <span className="text-xs text-on-surface-variant">
                          Hace una hora
                        </span>
                      </div>
                      <p
                        className="text-on-surface-variant leading-relaxed"
                      >
                        Ejemplo Comentario...
                      </p>
                    </div>
                  </div>
                </div>
              </section>
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
