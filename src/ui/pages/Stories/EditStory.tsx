import type z from "zod";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useStories } from "../../hooks/useStories";
import { useEffect, useRef, useState } from "react";
import type { StatusNames, StoryInfo, UpdateStory } from "../../../core/domain/models/stories/StoryModel";
import { ArrowBigDown, Check, Eye, EyeClosed, GripVertical, Info, List, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash } from "lucide-react";
import { getRandomCover } from "../utils/covers.util";
import ImageCropperModal from "../../components/images/ImageCropperModal";
import { updateSchema } from "../../schemas/stories/stories.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectCategoryModal from "../../components/stories/SelectCategoryModal";
import { GenreIcon } from "../../components/stories/GenresIcons";
import { getLastModifiedTime } from "../utils/time.util";
import SelectNewStatusModal from "../../components/stories/SelectNewStatusModal";
import { useChapters } from "../../hooks/useChapters";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import type { ChapterInfo } from "../../../core/domain/models/chapters/ChapterModel";
import { countTotalWords, parseTiptapContent, renderWithoutFormat } from "../utils/renderTiptap.util";
import PageNavigator from "../../components/navigation/PageNavigator";
import { UsersRound } from "lucide-react";
import StoryCoauthorPanel from "../../components/requests/StoryCoauthorPanel";

type UpdateFormValues = z.infer<typeof updateSchema>;

const EditStory = () => {

  // Use Navigate
  const navigate = useNavigate();
  // Use Auth
  const { authUser } = useAuth();
  // Use Stories
  const { loading, loadStoryById, updateStory, updateStoryCover, deleteStoryCover, toggleStoryStatus } = useStories();
  // Use Chapters
  const { loading: loadingChapters, updating: updatingChapterOrder, createChapter, getOwnedChaptersByStory, toggleChapterStatus, deleteChapter, moveChapterOrder } = useChapters();
  // Extract storyId from the URI
  const { storyId } = useParams<{ storyId: string}>();
  // Find Story Details
  const [ story, setStory ] = useState<StoryInfo | null>(null);
  const [ manageCoauthors, setManageCoauthors ] = useState(false);
  const [ chapters, setChapters ] = useState<PageResponse<ChapterInfo> | null>(null);
  useEffect(() => {
    const loadStory = async () => {
      if (storyId && authUser) {
        const responseStory = await loadStoryById(storyId);
        if (responseStory === null) {
          navigate("/network-lost");
        }
        setStory(responseStory);

      }
    };
    loadStory();
  }, [authUser, storyId, loadStoryById, navigate, getOwnedChaptersByStory]);

  // Modify Story
  const [ modifiedStory, setModifiedStory ] = useState<boolean>(false);
  useEffect(() => {
    const refreshStory = async () => {
      if (storyId && modifiedStory === true) {
        const refreshedStory = await loadStoryById(storyId);
        setStory(refreshedStory);
        setModifiedStory(false);
      }
    }
    refreshStory();
  }, [storyId, loadStoryById, modifiedStory]);
  const onStoryToggleStatus = async (storyId: string) => {
    if (story && authUser) {
      const success = await toggleStoryStatus(storyId);
      if (success) {
        setModifiedStory(true);
      }
    }
  }

  // Use Form and IsEditing Values...
  const { register, handleSubmit, setValue, reset } = useForm({
    resolver: zodResolver(updateSchema)
  });
  const [ isEditingTitle, setIsEditingTitle ] = useState<boolean>(false);
  const [ isEditingDescription, setIsEditingDescription ] = useState<boolean>(false);
  const [ editingGenreOrSubgenre, setEditingGenreOrSubgenre ] = useState<"genre" | "subgenre" | null>(null);
  const [ editingStatus, setEditingStatus ] = useState<boolean>(false);

  useEffect(() => {
    if (story) {
      reset({
        title: story?.title,
        description: story?.description,
        genreName: story?.genre.name,
        secondaryGenreName: story?.secondaryGenre.name,
        status: story?.status,
      });
    }
  }, [story, reset]);

  const onSubmit = async (data: UpdateFormValues): Promise<boolean> => {
    if (story) {
      const updateRequest: UpdateStory = { ...data, status: data.status as StatusNames };
      const success = await updateStory(updateRequest, story.id);
      if (success) setModifiedStory(true);
      return success;
    }
    return false;
  }

  const handleGenreOrSubgenreUpdate = async (genreName : string) => {
    const fieldToUpdate = editingGenreOrSubgenre === "genre" ? "genreName" : "secondaryGenreName";
    setValue(fieldToUpdate, genreName);
    
    setEditingGenreOrSubgenre(null);
    handleSubmit(onSubmit)();
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setValue("status", newStatus);
    
    setEditingStatus(false);
    handleSubmit(onSubmit)();
  }

  // Modify Cover
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [ selectedCover, setSelectedCover ] = useState<string | null>(null);
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => setSelectedCover(reader.result as string);
    }
  }
  const handleCoverUpdate = async (blob: Blob) => {
    if (story && authUser) {
      const coverFile = new File([blob], "cover.jpg", { type: "image/jpeg" });
      const success = await updateStoryCover(coverFile, story.id);
      if (success) {
        setSelectedCover(null);
        setModifiedStory(true);
      }
    }
  }
  const handleDeleteCover = async () => {
    if (story && authUser) {
      const success = await deleteStoryCover(story.id);
      if (success) {
        setModifiedStory(true);
      }
    }
  }

  // Modify Chapters
  const [ modifiedChapters, setModifiedChapters ] = useState<boolean>(false);
  const [ listByNewestFirst, setListByNewestFirst ] = useState<boolean>(true);
  const [ page, setPage ] = useState<number>(0);
  const [ draggedChapterId, setDraggedChapterId ] = useState<string | null>(null);
  const [ dragTargetId, setDragTargetId ] = useState<string | null>(null);
  const [ targetOrders, setTargetOrders ] = useState<Record<string, number>>({});
  useEffect(() => {
    const refreshChapters = async () => {
      if (story) {
        const refreshedChapters = await getOwnedChaptersByStory({offset: page * 5, limit: 5, newestFirst: listByNewestFirst}, story.id);
        setChapters(refreshedChapters);
        setModifiedChapters(false);
      }
    }
    refreshChapters();
  }, [getOwnedChaptersByStory, modifiedChapters, story, listByNewestFirst, page])
  const onChapterCreation = async () => {
    if (story && authUser) {
      const success = await createChapter({ storyId: story.id });
      if (success) {
        setModifiedChapters(true);
      }
    }
  }
  const onChapterDeletion = async (chapterId: string) => {
    if (story && authUser) {
      const success = await deleteChapter(story.id, chapterId);
      if (success) {
        setModifiedChapters(true);
      }
    }
  }
  const onChapterToggleStatus = async (chapterId: string) => {
    if (story && authUser) {
      const success = await toggleChapterStatus(chapterId);
      if (success) {
        setModifiedChapters(true);
      }
    }
  }
  const onChapterOrderChange = async (chapterId: string, order: number) => {
    if (!chapters || order < 1 || order > chapters.meta.totalItems) return;
    const success = await moveChapterOrder(chapterId, order);
    if (success) {
      setTargetOrders({});
      setModifiedChapters(true);
    }
  }
  const onChapterDrop = (targetChapterId: string) => {
    if (!chapters || !draggedChapterId || draggedChapterId === targetChapterId) {
      setDraggedChapterId(null);
      setDragTargetId(null);
      return;
    }
    const targetChapter = chapters.data.find((chapter) => chapter.id === targetChapterId);
    if (targetChapter) void onChapterOrderChange(draggedChapterId, targetChapter.order);
    setDraggedChapterId(null);
    setDragTargetId(null);
  }

  return (
    <main className="relative h-full" id="info">
      {selectedCover && (
          <ImageCropperModal
              image={selectedCover}
              aspect={2/3}
              onCropComplete={handleCoverUpdate}
              onCancel={() => setSelectedCover(null)}
              loading={loading}
          />
      )}

      { editingGenreOrSubgenre && (
        <SelectCategoryModal
          onSelect={(value: string) => {
            handleGenreOrSubgenreUpdate(value);
          }}
          onCancel={() => setEditingGenreOrSubgenre(null)}
          repeatedGenres={[story!.genre.name, story!.secondaryGenre.name]}
        />
      )}

      { editingStatus && (
        <SelectNewStatusModal
          onSelect={(value: string) => {
            handleStatusUpdate(value);
          }}
          onCancel={() => setEditingStatus(false)}
          repeatedStatus={[story!.status]}
        />
      )}

      { story && !modifiedStory ? (
        <div className="w-full min-w-0 p-4 sm:p-8 lg:p-14 xl:px-30 max-w-7xl mx-auto space-y-10 sm:space-y-16">
          <div className="flex justify-end">
            <button type="button" onClick={() => setManageCoauthors(true)} className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary/30 bg-surface-container-low px-4 py-3 font-semibold text-on-surface transition hover:bg-primary/10 active:scale-95">
              <UsersRound size={18} /> Gestionar coautores
            </button>
          </div>
          {manageCoauthors && <StoryCoauthorPanel storyId={story.id} onClose={() => setManageCoauthors(false)} />}
          <section className="relative">
            <nav className="hidden xl:flex fixed top-26 right-8 2xl:right-20 flex-col gap-2 z-10">
              <a href="#info" className="p-4 rounded-xl text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:shadow-lg hover:shadow-primary-container/10 transition-all" title="Basic Info">
                <Info size={20} />
              </a>
              <a href="#chapters" className="p-4 rounded-xl text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:shadow-lg hover:shadow-primary-container/10 transition-all" title="Chapters">
                <List size={20} />
              </a>
            </nav>
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/** Modify Cover */}
              <div className="group relative w-full max-w-[320px] aspect-2/3 rounded-xl overflow-hidden shadow-2xl shadow-black/40 bg-surface-container-highest shrink-0">
                <img
                  src={story.coverUrl ? story.coverUrl : getRandomCover()}
                  alt="Portada de la Historia"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="bg-several-light cursor-pointer text-surface px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <span className="text-lg">
                      <Pencil size={20} fill="currentColor" />
                    </span>
                    Cambiar
                  </button>
                  {/** Input to select Image */}
                  <input
                      type="file"
                      ref={coverInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={handleCoverChange}
                  />
                  {/** Delete Image */}
                  <button
                    onClick={() => handleDeleteCover()}
                    className="bg-primary-container cursor-pointer text-surface px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <span className="text-lg">
                      <Trash size={20} fill="currentColor" />
                    </span>
                    Eliminar
                  </button>
                </div>
              </div>
              {/** Modify Title and Description */}
              <div className="flex-1 min-w-0 w-full space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {!isEditingTitle ? (
                      <h1
                        onClick={() => setIsEditingTitle(true)}
                        className="text-3xl sm:text-5xl font-display font-extrabold py-3 tracking-tight text-fujiWhite group cursor-pointer inline-flex items-start gap-3 transition-all break-words max-w-full"
                      >
                        {story.title}
                        <span className="text-primary/40 group-hover:text-primary transition-colors">
                          <Pencil size={24} />
                        </span>
                      </h1>
                    ) : (
                      <div className="inline-flex items-center gap-2 sm:gap-4 w-full max-w-3xl min-w-0">
                        <input
                          {...register("title")}
                          type="text"
                          className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight bg-transparent border-b-2 border-global/60 text-fujiWhite outline-none w-full min-w-0 animate-in fade-in duration-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSubmit(async (data) => {
                              const success = await onSubmit(data);
                              if (success) setIsEditingTitle(false);
                            })}
                            className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                          >
                            <Check size={24} />
                          </button>
                          <button
                            onClick={() => {
                              setValue("title", story?.title);
                              setIsEditingTitle(false);
                            }}
                            className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                          >
                            <RotateCcw size={24} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full max-w-3xl">
                    <button
                      onClick={() => setEditingGenreOrSubgenre("genre")}
                      className="cursor-pointer flex items-center justify-between bg-surface-container-low px-6 py-4 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-primary/60">
                          <GenreIcon name={story.genre.name} size={24} />
                        </span>
                        {story.genre.name}
                      </span>
                    </button>
                    <button
                      onClick={() => setEditingGenreOrSubgenre("subgenre")}
                      className="cursor-pointer flex items-center justify-between bg-surface-container-low px-6 py-4 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-primary/60">
                          <GenreIcon name={story.secondaryGenre.name} size={24} />
                        </span>
                        {story.secondaryGenre.name}
                      </span>
                    </button>
                  </div>
                </div>
                {!isEditingDescription ? (
                  <div
                    onClick={() => setIsEditingDescription(true)}
                    className="relative group cursor-pointer p-4 sm:p-6 rounded-2xl glass-panel w-full max-w-3xl min-h-55 max-h-80 overflow-y-auto custom-scrollbar-edit"
                  >
                    <h3 className="text-on-surface-variant font-bold text-md uppercase tracking-widest mb-4 flex items-center justify-between">
                      Sinopsis
                      <span className="text-primary/40 group-hover:text-primary transition-colors">
                        <Pencil size={24} />
                      </span>
                    </h3>
                    <p className="text-on-surface/80 h-max leading-relaxed text-lg font-light italic">
                      {story.description}
                    </p>
                  </div>
                ) : (
                  <div className="relative p-4 sm:p-6 rounded-2xl glass-panel w-full max-w-3xl min-h-55 border border-primary/50">
                    <h3 className="text-on-surface-variant font-bold text-md uppercase tracking-widest mb-4 flex items-center justify-between">
                      Sinopsis
                      <div className="inline-flex gap-4">
                        <span
                          onClick={handleSubmit(async (data) => {
                            const success = await onSubmit(data);
                            if (success) setIsEditingDescription(false);
                          })}
                          className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                        >
                          <Check size={24} />
                        </span>
                        <span
                          onClick={() => {
                            setValue("description", story.description)
                            setIsEditingDescription(false);
                          }}
                          className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                        >
                          <RotateCcw size={24} />
                        </span>
                      </div>
                    </h3>
                    <textarea
                      {...register("description")}
                      autoFocus
                      className="w-full h-30 bg-surface-container-highest border-none rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary transition-all outline-none focus:outline-none resize-none custom-scrollbar-edit"
                      placeholder="Modifica la Sinopsis..."
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-2 sm:px-6 w-full max-w-3xl">
                  <div className="space-y-1">
                    <span className="text-xs text-on-surface-variant/60 uppercase tracking-tighter font-bold">
                      Capítulos
                    </span>
                    <p className="text-xl font-display font-bold text-on-surface">
                      {story.totalChapters}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-on-surface-variant/60 uppercase tracking-tighter font-bold">
                      Estado
                    </span>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-display font-bold text-primary">
                        {story.status.replace("_", " ")}
                      </p>
                      <span
                        onClick={() => setEditingStatus(true)}
                        className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Pencil size={24} />
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-on-surface-variant/60 uppercase tracking-tighter font-bold">
                      Actualizado
                    </span>
                    <p className="text-xl font-display font-bold text-on-surface">
                      {getLastModifiedTime(story.updatedAt ?? story.lastActivityAt ?? story.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4 justify-center">
                  <h3 className="text-md text-on-surface-variant/60 tracking-tighter font-bold mb-2">
                    Visibilidad
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-display font-bold text-primary">
                      {story.hidden ? "PRIVADO" : "PÚBLICO"}
                    </p>
                    <button
                      onClick={() => onStoryToggleStatus(story.id)}
                      className="p-2 hover:text-high-enfasis rounded-lg text-on-surface-variant transition-colors cursor-pointer"
                    >
                      <span>
                        {story.hidden ? (
                          <EyeClosed size={24} />
                        ) : (
                          <Eye size={24} />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-8 justify-center">
                  <h3 className="text-md text-on-surface-variant/60 tracking-tighter font-bold mb-2">
                    Tags
                  </h3>
                </div>
              </div>
            </div>
          </section>
          <section className="space-y-8" id="chapters">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/10 pb-6">
              <div>
                <h2 className="text-3xl font-display font-bold text-on-surface mb-2">
                  Capítulos
                </h2>
                <p className="text-on-surface-variant/60 font-body">
                  Administra y organiza el avance de tu historia
                </p>
              </div>
              <button
                onClick={() => setListByNewestFirst(!listByNewestFirst)}
                className="flex items-center gap-2 hover:bg-inverse-on-surface transition-all duration-300 p-2 rounded-lg cursor-pointer self-start"
              >
                {listByNewestFirst ? "Traer más viejos" : "Traer más nuevos"}
                <ArrowBigDown
                  className={`transition-transform duration-300 transform
                      ${listByNewestFirst ? "rotate-360" : "rotate-180"}`}
                  size={24}
                />
              </button>
              {!loadingChapters ? (
                <button
                  disabled={loadingChapters}
                  onClick={() => onChapterCreation()}
                  className="bg-primary-container text-on-primary-container px-5 py-3 sm:px-6 sm:py-4 rounded-full font-bold flex items-center gap-3 hover:scale-95 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <span>
                    <Plus size={20} />
                  </span>
                  Crear Capítulo
                </button>
              ) : (
                <div className="flex items-center justify-center w-42 h-10">
                  <div className="loading-button" />
                </div>
              )}
            </div>
            <div className="grid gap-4">
              { chapters && chapters.data.length > 0 ? (
                chapters.data.map(chapter => (
                  <div
                    key={chapter.id}
                    draggable={!updatingChapterOrder}
                    onDragStart={(event) => {
                      setDraggedChapterId(chapter.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", chapter.id);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragTargetId(chapter.id);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      onChapterDrop(chapter.id);
                    }}
                    onDragEnd={() => {
                      setDraggedChapterId(null);
                      setDragTargetId(null);
                    }}
                    className={`group flex flex-col gap-3 rounded-2xl border bg-surface-container-low p-4 transition-all sm:p-6 sm:flex-row sm:items-center sm:justify-between ${
                      dragTargetId === chapter.id ? "border-primary/70 bg-primary/5" : "border-transparent hover:border-primary/20"
                    } ${draggedChapterId === chapter.id ? "scale-[0.99] opacity-40" : ""} ${updatingChapterOrder ? "cursor-wait" : "cursor-grab active:cursor-grabbing"}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-6 min-w-0">
                      <GripVertical size={20} aria-hidden="true" className="mt-1 shrink-0 text-on-surface-variant/50 sm:mt-0" />
                      <span className="text-xl sm:text-2xl font-display font-black text-on-surface-variant/50 italic shrink-0">
                        {String(chapter.order).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h4 className={`text-lg ${chapter.title ? "font-bold text-on-surface group-hover:text-primary transition-colors" : "font-light text-on-surface-variant/40 italic"}`}>
                          {chapter.title ? renderWithoutFormat(parseTiptapContent(chapter.title)) : "Sin título"}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {chapter.hidden ? "Borrador" : "Publicado"} • Última Edición {chapter.updatedAt ? getLastModifiedTime(chapter.updatedAt) : "Nunca"} • {chapter.content ? countTotalWords(parseTiptapContent(chapter.content)) : 0} palabras
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {chapters.meta.totalItems > 5 && (
                        <details
                          className="relative"
                          onClick={(event) => event.stopPropagation()}
                          onDragStart={(event) => event.stopPropagation()}
                        >
                          <summary
                            aria-label={`Cambiar posición de ${chapter.title || `capítulo ${chapter.order}`}`}
                            className="flex cursor-pointer list-none items-center gap-2 rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant"
                          >
                            <SlidersHorizontal size={20} />
                            <span className="text-xs font-semibold sm:hidden">Posición</span>
                          </summary>
                          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-outline-variant/20 bg-surface-container-high p-4 shadow-xl">
                            <label className="block text-xs font-semibold text-on-surface">
                              Nueva posición: {targetOrders[chapter.id] ?? chapter.order} de {chapters.meta.totalItems}
                              <input
                                type="range"
                                min={1}
                                max={chapters.meta.totalItems}
                                step={1}
                                value={targetOrders[chapter.id] ?? chapter.order}
                                onChange={(event) => setTargetOrders((current) => ({ ...current, [chapter.id]: Number(event.target.value) }))}
                                className="mt-3 w-full cursor-pointer accent-primary"
                              />
                            </label>
                            <button
                              type="button"
                              disabled={updatingChapterOrder || (targetOrders[chapter.id] ?? chapter.order) === chapter.order}
                              onClick={() => void onChapterOrderChange(chapter.id, targetOrders[chapter.id] ?? chapter.order)}
                              className="mt-3 w-full cursor-pointer rounded-lg bg-primary px-3 py-2 text-sm font-bold text-on-primary transition-transform hover:scale-[0.98] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Mover capítulo
                            </button>
                          </div>
                        </details>
                      )}
                      <button
                        type="button"
                        aria-label={`Editar ${chapter.title || `capítulo ${chapter.order}`}`}
                        onClick={() => navigate("/write", {
                          state: { chapterToEdit: chapter }
                        })}
                        className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant transition-colors cursor-pointer"
                      >
                        <span>
                          <Pencil size={24} />
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={chapter.hidden ? "Publicar capítulo" : "Ocultar capítulo"}
                        onClick={() => onChapterToggleStatus(chapter.id)}
                        className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant transition-colors cursor-pointer"
                      >
                        <span>
                          {chapter.hidden ? (
                            <Eye size={24} />
                          ) : (
                            <EyeClosed size={24} />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="Eliminar capítulo"
                        onClick={() => onChapterDeletion(chapter.id)}
                        className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant transition-colors cursor-pointer"
                      >
                        <span>
                          <Trash size={24} />
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                !loadingChapters ? (
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
            {chapters && (
              <PageNavigator
                page={chapters.meta.numberPage}
                totalPages={chapters.meta.totalPages}
                onPageChange={setPage}
              />
            )}
          </section>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="loading-button" />
        </div>
      )}
    </main>
  )
}

export default EditStory;
