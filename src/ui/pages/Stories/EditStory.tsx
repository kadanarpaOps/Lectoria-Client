import type z from "zod";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useStories } from "../../hooks/useStories";
import { useEffect, useRef, useState } from "react";
import type { StatusNames, StoryInfo, UpdateStory } from "../../../core/domain/models/stories/StoryModel";
import { ArrowBigDown, Check, ChevronLeft, ChevronRight, Eye, EyeClosed, Info, List, Pencil, Plus, RotateCcw, Trash } from "lucide-react";
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
import { countTotalWords, renderWithoutFormat } from "../utils/renderTiptap.util";

type UpdateFormValues = z.infer<typeof updateSchema>;

const EditStory = () => {

  // Use Navigate
  const navigate = useNavigate();
  // Use Auth
  const { authUser } = useAuth();
  // Use Stories
  const { loading, loadStoryById, updateStory, updateStoryCover, deleteStoryCover, toggleStoryStatus } = useStories();
  // Use Chapters
  const { loading: loadingChapters, createChapter, getOwnedChaptersByStory, toggleChapterStatus, deleteChapter } = useChapters();
  // Extract storyId from the URI
  const { storyId } = useParams<{ storyId: string}>();
  // Find Story Details
  const [ story, setStory ] = useState<StoryInfo | null>(null);
  const [ chapters, setChapters ] = useState<PageResponse<ChapterInfo> | null>(null);
  useEffect(() => {
    const loadStory = async () => {
      if (storyId && authUser?.userId) {
        const responseStory = await loadStoryById(storyId);
        if (responseStory === null) {
          navigate("/network-lost");
        }
        if (responseStory.userId !== authUser.userId) {
          navigate("/forbidden")
        }
        setStory(responseStory);

        const responseChapters = await getOwnedChaptersByStory({offset: 1, limit: 5, newestFirst: true}, responseStory.id);
        setChapters(responseChapters);
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
  const [ page, setPage ] = useState<number>(1);
  useEffect(() => {
    const refreshChapters = async () => {
      if (story) {
        const refreshedChapters = await getOwnedChaptersByStory({offset: page, limit: 5, newestFirst: listByNewestFirst}, story.id);
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

  if (!authUser?.userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <section className="rounded-3xl border border-amber-400/20 bg-background-global p-8">
          <h1 className="text-3xl font-bold text-global">Editar historia</h1>
          <p className="mt-4 text-several-light">La API de Lectoria no incluye el identificador de usuario necesario para comprobar la propiedad de una historia en story-service.</p>
        </section>
      </main>
    );
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
        <div className="p-8 md:p-14 md:px-30 max-w-7xl mx-auto space-y-16">
          <section className="relative">
            <nav className="fixed top-26 right-20 flex flex-col gap-2 z-10">
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
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {!isEditingTitle ? (
                      <h1
                        onClick={() => setIsEditingTitle(true)}
                        className="text-5xl font-display font-extrabold py-3 tracking-tight text-fujiWhite group cursor-pointer inline-flex items-center gap-4 transition-all"
                      >
                        {story.title}
                        <span className="text-primary/40 group-hover:text-primary transition-colors">
                          <Pencil size={24} />
                        </span>
                      </h1>
                    ) : (
                      <div className="inline-flex items-center gap-4 w-130">
                        <input
                          {...register("title")}
                          type="text"
                          className="text-5xl font-display font-extrabold tracking-tight bg-transparent border-b-2 border-global/60 text-fujiWhite outline-none w-full animate-in fade-in duration-300"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-140">
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
                    className="relative group cursor-pointer p-6 rounded-2xl glass-panel w-140 h-55 overflow-y-scroll custom-scrollbar-edit"
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
                  <div className="relative p-6 rounded-2xl glass-panel w-140 h-55 border border-primary/50">
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
                <div className="grid grid-cols-2 md:grid-cols-5 px-6 w-140">
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
                      {story.updatedAt ? getLastModifiedTime(story.updatedAt): "Nunca"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 mt-8">
              <div className="grid grid-cols-12">
                <div className="col-span-4 justify-center">
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
                <div className="col-span-8 justify-center">
                  <h3 className="text-md text-on-surface-variant/60 tracking-tighter font-bold mb-2">
                    Tags
                  </h3>
                </div>
              </div>
            </div>
          </section>
          <section className="space-y-8" id="chapters">
            <div className="flex items-end justify-between border-b border-outline-variant/10 pb-6">
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
                className="flex items-center gap-2 hover:bg-inverse-on-surface transition-all duration-300 p-1 rounded-lg cursor-pointer"
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
                  className="bg-primary-container text-on-primary-container px-6 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-95 transition-all cursor-pointer"
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
                  <div key={chapter.id} className="group flex items-center justify-between p-6 rounded-2xl bg-surface-container-low border border-transparent hover:border-primary/20 transition-all cursor-default">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-display font-black text-on-surface-variant/50 italic">
                        {String(chapter.order).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className={`text-lg ${chapter.title ? "font-bold text-on-surface group-hover:text-primary transition-colors" : "font-light text-on-surface-variant/40 italic"}`}>
                          {chapter.title ? (renderWithoutFormat(JSON.parse(chapter.title))) : "Sin título"}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {chapter.hidden ? "Borrador" : "Publicado"} • Última Edición {chapter.updatedAt ? getLastModifiedTime(chapter.updatedAt) : "Nunca"} • {chapter.content ? (chapter.content.trim().length > 0 && countTotalWords(JSON.parse(chapter.content))) : 0} palabras
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
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
            { chapters && chapters.data.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                {/** Previous Navigation */}
                <button
                  onClick={() => setPage(chapters?.meta.numberPage - 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/10 text-on-surface-variant
                    ${chapters?.meta.numberPage !== 1 && "hover:bg-surface-variant/20 transition-colors cursor-pointer"}`}
                  disabled={chapters?.meta.numberPage === 1}
                >
                  <span>
                    <ChevronLeft size={24} />
                  </span>
                </button>
                {/** Actual Page - 1 */}
                {chapters?.meta.numberPage !== 1 && (
                  <button
                    onClick={() => setPage(chapters?.meta.numberPage - 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-variant/20 text-on-surface transition-colors cursor-pointer"
                  >
                    {chapters?.meta.numberPage - 1}
                  </button>
                )}
                {/** Actual Page */}
                <button
                  disabled={true}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-bold cursor-default"
                >
                  {chapters?.meta.numberPage}
                </button>
                {/** Actual Page + 1 */}
                {chapters?.meta.numberPage !== chapters?.meta.totalPages && (
                  <button
                    onClick={() => setPage(chapters?.meta.numberPage + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-variant/20 text-on-surface transition-colors cursor-pointer"
                  >
                    {chapters?.meta.numberPage + 1}
                  </button>
                )}
                {/** Next Navigation */}
                <button
                  onClick={() => setPage(chapters?.meta.numberPage + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/10 text-on-surface-variant
                    ${chapters?.meta.numberPage !== chapters?.meta.totalPages && "hover:bg-surface-variant/20 transition-colors cursor-pointer"}`}
                  disabled={chapters?.meta.numberPage === chapters?.meta.totalPages}
                >
                  <span>
                    <ChevronRight size={24} />
                  </span>
                </button>
              </div>
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
