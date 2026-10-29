import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, ImageMinus, Pen, SquarePen, Star } from "lucide-react";
import ImageCropperModal from "../../components/images/ImageCropperModal";
import { useAuth } from "../../hooks/useAuth";
import { useStories } from "../../hooks/useStories";
import type { StoryInfo } from "../../../core/domain/models/stories/StoryModel";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import { UserService } from "../../../core/use-cases/UserUseCases";
import { useAlert } from "../../hooks/useAlert";
import { getRandomCover } from "../utils/covers.util";
import { AxiosError } from "axios";

const userService = new UserService();

const getGenreName = (genre: unknown): string => {
  if (typeof genre === "string") return genre;
  if (typeof genre === "object" && genre !== null && "name" in genre) {
    return String(genre.name);
  }
  return "Sin género";
};

export default function Profile() {
  const navigate = useNavigate();
  const { authUser, setModifiedAuthUser } = useAuth();
  const { loadStoriesForAuthUser, loadAuthUserFavorites, loading, error } = useStories();
  const { showAlert } = useAlert();
  const [userStories, setUserStories] = useState<PageResponse<StoryInfo> | null>(null);
  const [savedStories, setSavedStories] = useState<PageResponse<StoryInfo> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return;
    let active = true;
    const loadProfileStories = async () => {
      const [ownStories, favorites] = await Promise.all([
        loadStoriesForAuthUser({ offset: 1, limit: 7, newestFirst: true }),
        loadAuthUserFavorites({ offset: 1, limit: 1, newestFirst: true }),
      ]);
      if (active) {
        setUserStories(ownStories);
        setSavedStories(favorites);
      }
    };
    void loadProfileStories();
    return () => {
      active = false;
    };
  }, [authUser, loadAuthUserFavorites, loadStoriesForAuthUser]);

  const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Elige una imagen JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("La imagen debe pesar menos de 10 MB.");
      event.target.value = "";
      return;
    }
    setImageError(null);
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.onerror = () => setImageError("No se pudo leer el archivo seleccionado.");
    reader.readAsDataURL(file);
  };

  const uploadImage = async (blob: Blob) => {
    setImageLoading(true);
    setImageError(null);
    try {
      await userService.uploadProfileImage(new File([blob], "profile.jpg", { type: "image/jpeg" }));
      setModifiedAuthUser(true);
      setSelectedImage(null);
      showAlert("La foto de perfil se actualizó.", 4000, "SUCCESS");
    } catch (error) {
      const message = error instanceof AxiosError
        ? error.response?.data?.message ?? "No se pudo subir la foto de perfil."
        : "No se pudo subir la foto de perfil.";
      setImageError(message);
      showAlert(message, 5000, "ERROR");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    setImageLoading(true);
    setImageError(null);
    try {
      await userService.removeProfileImage();
      setModifiedAuthUser(true);
      showAlert("La foto de perfil se eliminó.", 4000, "SUCCESS");
    } catch (error) {
      const message = error instanceof AxiosError
        ? error.response?.data?.message ?? "No se pudo eliminar la foto de perfil."
        : "No se pudo eliminar la foto de perfil.";
      setImageError(message);
      showAlert(message, 5000, "ERROR");
    } finally {
      setImageLoading(false);
    }
  };

  if (!authUser) {
    return <div className="flex min-h-full items-center justify-center"><div className="loading-button" /></div>;
  }

  const roleNames = authUser.userRoles;
  const totalViews = userStories?.data.reduce((total, story) => total + story.totalViews, 0) ?? 0;
  const totalSavedStories = savedStories?.meta.totalItems ?? 0;

  return (
    <main className="relative h-full pb-20">
      {selectedImage && (
        <ImageCropperModal
          image={selectedImage}
          aspect={1}
          onCropComplete={uploadImage}
          onCancel={() => {
            setSelectedImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          loading={imageLoading}
        />
      )}
      <div className="relative h-55 w-full overflow-hidden">
        <img
          src="https://images.pexels.com/photos/29253139/pexels-photo-29253139.jpeg"
          alt="Paisaje montañoso"
          className="h-full w-full object-cover grayscale opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background-global to-transparent">
          <div className="absolute right-12 top-8 z-20 flex flex-col items-end gap-3">
            {roleNames.includes("LECTORIA_ADMIN") ? (
              <span className="rounded-full border border-high-enfasis bg-high-enfasis/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-high-enfasis">
                Administrador
              </span>
            ) : (
              <>
                <span className="rounded-full border border-high-enfasis bg-high-enfasis/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-high-enfasis">
                  Escritor
                </span>
                <span className="rounded-full border border-high-enfasis bg-high-enfasis/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-high-enfasis">
                  Lector
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-12 px-6 sm:px-12">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex items-end gap-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Cambiar foto de perfil"
              className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-background-global bg-background-global shadow-2xl"
            >
              {authUser.profileImageUrl ? (
                <img src={authUser.profileImageUrl} alt={`Foto de ${authUser.username}`} className="h-full w-full object-cover transition-opacity group-hover:opacity-40" />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.username)}&background=dcd7ba&color=16161d`}
                  alt={`Foto de ${authUser.username}`}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-40"
                />
              )}
              <span className="absolute inset-0 flex items-center justify-center text-several-light opacity-0 transition-opacity group-hover:opacity-100">
                <Pen size={30} />
              </span>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={selectImage} />
            </button>
            <div className="pb-2">
              <h1 className="text-3xl font-bold text-global">{authUser.username}</h1>
              <p className="font-medium text-several-light">{authUser.email}</p>
            </div>
          </div>
          {authUser.profileImageUrl && (
            <div className="flex min-w-43 items-center justify-center pb-2">
              <button
                type="button"
                disabled={imageLoading}
                onClick={() => void removeImage()}
                className="flex cursor-pointer items-center gap-3 rounded-full bg-primary-container px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-95 disabled:opacity-50"
              >
                {imageLoading ? <span className="loading-button" /> : <><ImageMinus size={20} />Eliminar Foto</>}
              </button>
            </div>
          )}
        </div>
        {imageError && <p role="alert" className="mt-3 text-sm text-red-300">{imageError}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        {!authUser.profileImageUrl && <p className="mt-2 text-xs text-several-light">JPG, PNG o WEBP; hasta 10 MB.</p>}

        <section className="mt-6 max-w-3xl">
          <p className="leading-relaxed text-global/60">
            Bienvenido a tu perfil, gestiona tus historias o introdúcete en otros mundos, tú decides.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-several-light">
            <div className="flex items-center gap-1.5">
              <strong className="text-global">{userStories?.meta.totalItems ?? 0}</strong>
              <span>Historias</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-toolbar-bg/50" />
            <div className="flex items-center gap-1.5">
              <strong className="text-global">{totalViews}</strong>
              <span>Vistas</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-toolbar-bg/50" />
            <div className="flex items-center gap-1.5">
              <strong className="text-global">{totalSavedStories}</strong>
              <span>Historias Guardadas</span>
            </div>
          </div>
        </section>

        <div className="mt-12 border-b border-toolbar-bg/10">
          <span className="inline-block border-b-2 border-high-enfasis px-2 pb-4 font-bold text-high-enfasis">Tus Historias</span>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => navigate("/story/create")}
            className="group col-span-1 flex aspect-3/4 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-dashed border-high-enfasis/30 transition-all hover:border-high-enfasis hover:bg-high-enfasis/5"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-high-enfasis/10 text-high-enfasis transition-transform group-hover:scale-110">
              <SquarePen size={24} />
            </span>
            <span className="text-lg font-bold text-global">Nueva Historia</span>
          </button>
          {userStories?.data.map((story) => (
            <article key={story.id} className="group cursor-pointer" onClick={() => navigate(`/story/edit/${story.id}`)}>
              <div className="relative col-span-1 aspect-3/4 overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                <img src={story.coverUrl || getRandomCover()} alt={`Portada de ${story.title}`} className="h-full w-full object-cover" />
                <span className="absolute right-3 top-3 rounded bg-background-global/80 px-2 py-1 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                  {getGenreName(story.genre)}
                </span>
                <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-4 text-xs text-white">
                    <span className="flex items-center gap-1"><Eye size={20} />{story.totalViews}</span>
                    <span className="flex items-center gap-1"><Star size={20} />{story.totalRating}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 px-2">
                <h2 className="line-clamp-1 text-lg font-bold text-global">{story.title}</h2>
                <p className="mt-1 shrink-0 text-sm text-several-light">{story.totalChapters} Capítulos</p>
              </div>
            </article>
          ))}
          {loading && !userStories && <div className="col-span-full flex justify-center py-12"><div className="loading-button" /></div>}
          {userStories && userStories.data.length === 0 && (
            <p className="col-span-full py-8 text-center text-several-light">Aún no has creado historias.</p>
          )}
        </div>
      </div>
    </main>
  );
}
