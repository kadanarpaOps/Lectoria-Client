import type z from "zod";
import { Bell, Bolt, Cog, ImageUp, Plus, PlusIcon, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react";
import SelectCategoryModal from "../../components/stories/SelectCategoryModal";
import { registerSchema } from "../../schemas/stories/stories.schema";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import type { BasicInfo, RegisterStory } from "../../../core/domain/models/stories/StoryModel";
import { useStories } from "../../hooks/useStories";
import { useAuth } from "../../hooks/useAuth";
import { GenreIcon } from "../../components/stories/GenresIcons";
import ImageCropperModal from "../../components/images/ImageCropperModal";

type CreateFormValues = z.infer<typeof registerSchema>;

const CreateStory = () => {
  // Use Navigate
  const navigate = useNavigate();
  // Use Stories
  const { loading, createStory, pageTags } = useStories();
  // Use Auth
  const { authUser } = useAuth();
  // Show Set Genres Modal
  const [ modalMode, setModalMode ] = useState<"genre" | "subgenre" | null>(null);
  // Use Form
  const { register, handleSubmit, setValue, control, formState: { isSubmitting, errors }, reset } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tagNames: [],
      genreName: "",
      secondaryGenreName: "",
      image: null,
    }
  });

  // Watch for RealTime values
  const currentGenre = useWatch({ control, name: "genreName" });
  const currentSubgenre = useWatch({ control, name: "secondaryGenreName" });
  const currentTags = useWatch({ control, name: "tagNames" });

  // Handle Genre Selection
  const handleSelectGenre = (value: string) => {
    if (modalMode === "genre") setValue("genreName", value);
    if (modalMode === "subgenre") setValue("secondaryGenreName", value);
    setModalMode(null)
  }
  
  // Cover Input Management
  const [ selectedCover, setSelectedCover ] = useState<string | null>(null);
  const [ previewUrl, setPreviewUrl ] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => setSelectedCover(reader.result as string);
    }
  }
  const handleCoverSelect = async (blob: Blob) => {
    const coverFile = new File([blob], "cover.jpg", { type: "image/jpeg" });
    setValue("image", coverFile, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true 
    })
    const objectUrl = URL.createObjectURL(coverFile);
    setPreviewUrl(objectUrl);;
    setSelectedCover(null);
  }
  const handleCoverDeleteImage = () => {
    setValue("image", null);
    setPreviewUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  // Tags Input Management
  const [ toSearchTag, setToSearchTag ] = useState("");
  const [ tagResults, setTagResults ] = useState<BasicInfo[]>([]);
  const searchedTagRef = useRef<HTMLInputElement>(null);
  const handleTagInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const toSearch = e.target.value;
    setToSearchTag(toSearch);
    if (toSearch.trim() != "") {
      const searchResult = await pageTags(1, 3, toSearch);
      setTagResults(searchResult.data);
    } else {
      setToSearchTag("");
      setTagResults([]);
    }
  }
  const handleAddTag = (tagName: string) => {
    if (!currentTags!.includes(tagName)) {
      setValue("tagNames", [...currentTags!, tagName]);
    }
    setToSearchTag("");
    setTagResults([]);
  }
  const handleRemoveTag = (tagName: string) => {
    setValue("tagNames", currentTags!.filter((t) => t !== tagName));
  }

  // On Submit
  const onSubmit = async (data: CreateFormValues) => {
    if (!authUser) return;
    const success = await createStory(data as RegisterStory);
    if (success) {
      navigate("/profile");
      reset();
    }
  }

  /** UseEffect to Upload previewUrl value */
  useEffect(() => {
    // Solo revocar cuando el componente se desmonte o cambie la previewUrl
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <main className="flex min-h-screen overflow-x-hidden">
      {selectedCover && (
        <ImageCropperModal
          image={selectedCover}
          aspect={2/3}
          onCropComplete={handleCoverSelect}
          onCancel={() => setSelectedCover(null)}
          loading={loading}
        />
      )}
      { modalMode && (
        <SelectCategoryModal
          onSelect={(value: string) => {handleSelectGenre(value)}}
          onCancel={() => setModalMode(null)}
          repeatedGenres={modalMode === "genre" ? [currentSubgenre] : [currentGenre]}
        />
      )}
      <div className="grow bg-surface min-h-screen relative">
        <div className="absolute top-0 right-0 pointer-events-none select-none opacity-[0.03] -mr-20 -mt-10">
          <span className="text-[25rem] font-bold leading-none">
            INK
          </span>
        </div>
        <header className="flex justify-between items-center w-full px-4 sm:px-8 py-4 sm:py-6 z-40 bg-surface/80">
          <div className="flex items-center gap-4">
            <span className="font-headline font-semibold text-2xl tracking-tight text-primary">
              Lectoria
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-on-surface-variant hover:text-primary transition-all duration-300 cursor-pointer">
              <Bell size={20} />
            </span>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30">
              <img
                src={authUser?.profileImageUrl}
                alt="User Profile Image"
                className="w-full h-auto"
              />
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <aside className="w-full lg:w-1/3 flex flex-col items-center">
              <div
                className="relative group w-full max-w-75 aspect-2/3 rounded-xl glass-ghost flex flex-col items-center justify-center text-center p-8 bg-surface-container-low overflow-hidden transition-all hover:bg-surface-container-high"
                style={{
                  backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {previewUrl && <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all"></div>}
                <div className="absolute inset-4 border-2 border-dashed border-outline-variant/40 rounded-lg pointer-events-none"></div>
                <div className="z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
                    <span className="text-primary text-4xl">
                      <ImageUp size={24} />
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg mb-">Portada</h3>
                  <p className="text-on-surface-variant text-sm mb-8 px-4">Tamaño Sugerido: 600x900px</p>
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="cursor-pointer px-6 py-3 bg-on-surface text-surface rounded-full font-bold text-sm tracking-wide hover:scale-105 transition-transform active:scale-95 shadow-lg"
                  >
                    {previewUrl ? "Cambiar" : "Subir"} Portada
                  </button>
                  {previewUrl && (
                    <button
                      onClick={handleCoverDeleteImage}
                      className="cursor-pointer mt-4 px-6 py-3 bg-secondary text-surface rounded-full font-bold text-sm tracking-wide hover:scale-105 transition-transform active:scale-95 shadow-lg"
                    >
                      Eliminar Portada
                    </button>
                  )}
                  {/** Input to select Cover */}
                  <input
                      type="file"
                      ref={coverInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleCoverChange}
                  />
                  {errors.image && <p>{errors.image.message}</p>}
                </div>
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/5 blur-[80px] rounded-full"></div>
              </div>
              <div className="mt-6 text-on-surface-variant/40 text-[10px] uppercase tracking-widest text-center">
                Formato Aceptados: JPG, PNG, WEBP
              </div>
            </aside>
            {/** Main Form */}
            <section className="grow">
              <div className="mb-12">
                <h2 className="font-headline font-extrabold text-4xl sm:text-5xl text-on-surface tracking-tighter mb-4">
                  Nueva Historia
                </h2>
                <div className="h-1 w-20 bg-primary rounded-full"></div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                <div className="space-y-3">
                  {/** Title */}
                  <label className="block text-sm font-semibold tracking-wide text-primary/80 uppercase ml-1">
                    Título
                  </label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-highest border-none rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary transition-all outline-none focus:outline-none"
                    placeholder="Nombre de tu obra..."
                    {...register("title")}
                  />
                  {errors.title && <p>{errors.title.message}</p>}
                </div>
                <div className="space-y-3">
                  {/** Description */}
                  <label className="block text-sm font-semibold tracking-wide text-primary/80 uppercase ml-1">
                    Sinopsis
                  </label>
                  <textarea
                    className="w-full bg-surface-container-highest border-none rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary transition-all outline-none focus:outline-none resize-none"
                    placeholder="Cuéntanos de qué trata tu obra..."
                    rows={5}
                    {...register("description")}
                  />
                  {errors.description && <p>{errors.description.message}</p>}
                </div>
                {/** Genres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold tracking-wide text-primary/80 uppercase ml-1">
                      Género Principal
                    </label>
                    <button
                      onClick={() => setModalMode("genre")}
                      className="cursor-pointer w-full flex items-center justify-between bg-surface-container-low glass-ghost px-6 py-4 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-primary/60">
                          {currentGenre ? (
                            <GenreIcon name={currentGenre} size={24} />
                          ) : (
                            <Cog size={24} />
                          )}
                        </span>
                        {currentGenre || "Seleccionar Género"}
                      </span>
                      <span className="text-primary/60">
                        <Plus size={20} />
                      </span>
                    </button>
                    {errors.genreName && <p className="text-sm text-destructive mt-2">{errors.genreName.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold tracking-wide text-primary/80 uppercase ml-1">
                      Género Secundario
                    </label>
                    <button
                      onClick={() => setModalMode("subgenre")}
                      className="cursor-pointer w-full flex items-center justify-between bg-surface-container-low glass-ghost px-6 py-4 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-primary/60">
                          {currentSubgenre ? (
                            <GenreIcon name={currentSubgenre} size={24} />
                          ) : (
                            <Bolt size={24} />
                          )}
                        </span>
                        { currentSubgenre || "Seleccionar Subgénero"}
                      </span>
                      <span className="text-primary/60">
                        <Plus size={20} />
                      </span>
                    </button>
                    {errors.secondaryGenreName && <p className="text-sm text-destructive mt-2">{errors.secondaryGenreName.message}</p>}
                  </div>
                </div>
                <div className="relative w-full space-y-3">
                  <label className="block text-sm font-semibold tracking-wide text-primary/80 uppercase ml-1">
                    Etiquetas (Tags)
                  </label>
                  <div className="w-full bg-surface-container-highest rounded-xl p-3 flex flex-wrap items-center gap-3 min-h-16">
                    {currentTags?.map((tag, index) => (
                      <div
                        key={`${tag}-${index}`}
                        className="flex items-center gap-2 bg-secondary-container/30 text-secondary border border-secondary/20 px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-secondary-container/50"
                      >
                        {tag}
                        <span
                          onClick={() => handleRemoveTag(tag)}
                          className="text-xs cursor-pointer hover:text-on-surface"
                        >
                          <X size={12} />
                        </span>
                      </div>
                    ))}
                    <input
                      type="text"
                      className="bg-transparent border-none outline-none ring-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 grow px-2 py-1"
                      placeholder="Añadir..."
                      ref={searchedTagRef}
                      onChange={handleTagInputChange}
                    />
                    {errors.tagNames && <p>{errors.tagNames.message}</p>}
                  </div>
                  { toSearchTag && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-surface-bright/50 shadow-lg border border-toolbar-bg/10 rounded-xl z-50 overflow-hidden">
                      { !loading ? (
                        tagResults.length > 0 ? (
                          tagResults.filter((tag) => !currentTags?.includes(tag.name)).map((tag) => (
                            <div
                              key={tag.id}
                              onClick={() => handleAddTag(tag.name)}
                              className="px-4 py-2 hover:bg-high-enfasis/10 cursor-pointer text-md transition-colors"
                            >
                              {tag.name}
                            </div>
                          ))
                        ) : (
                          <div
                            onClick={() => handleAddTag(toSearchTag)}
                            className="px-4 py-2 hover:bg-primary-container/20 cursor-pointer text-md text-primary font-bold transition-colors flex items-center space-x-2"
                          >
                            <span>
                              <PlusIcon size={20} />
                            </span>
                            <span className="font-bold"> Crear Tag</span>
                          </div>
                        )
                      ) : (
                          <div
                            className="px-4 py-2 hover:bg-primary-container/20 cursor-pointer text-md text-primary font-bold transition-colors justify-center flex items-center space-x-2"
                          >
                            <div className="flex items-center justify-center w-10 h-10">
                              <div className="loading-button" />
                            </div>
                          </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="pt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-outline-variant/10">
                  {
                    (!loading || !isSubmitting) ? (
                      <>
                        <button
                          onClick={() => navigate(-1)}
                          className="text-on-surface-variant font-semibold px-6 py-3 sm:px-8 sm:py-4 sm:mr-3 hover:text-primary transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          className="bg-primary-container text-on-primary-container px-8 py-3 sm:px-12 sm:py-4 rounded-full font-bold text-base sm:text-lg tracking-tight hover:scale-95 transition-transform cursor-pointer"
                          type="submit"
                        >
                          Crear Historia
                        </button>
                      </>
                    ) : (
                      <div className="py-4 w-50 justify-center">
                        <div className="flex items-center justify-center w-10 h-10">
                          <div className="loading-button" />
                        </div>
                      </div>
                    )
                  }
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CreateStory
