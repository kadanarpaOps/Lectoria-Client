import { useRef, useState } from "react";
import { Link } from "react-router";
import { Camera, ImageMinus, UserRound } from "lucide-react";
import { AxiosError } from "axios";
import ImageCropperModal from "../../components/images/ImageCropperModal";
import { useAuth } from "../../hooks/useAuth";
import { UserService } from "../../../core/use-cases/UserUseCases";
import { useAlert } from "../../hooks/useAlert";

const userService = new UserService();

export default function Profile() {
  const { authUser, setModifiedAuthUser } = useAuth();
  const { showAlert } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  if (!authUser) return null;
  const roles = authUser.userRoles.map((role) => role.replaceAll("_", " ")).join(" · ");

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
      const image = new File([blob], "profile.jpg", { type: "image/jpeg" });
      await userService.uploadProfileImage(image);
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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
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
      <header className="rounded-3xl border border-toolbar-bg/10 bg-background-global p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-high-enfasis">Mi perfil</p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-toolbar-bg/20 bg-inputs-bg">
            {authUser.profileImageUrl ? (
              <img src={authUser.profileImageUrl} alt={`Foto de perfil de ${authUser.username}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-several-light"><UserRound size={40} /></div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-4xl font-bold text-global">{authUser.username}</h1>
            <p className="mt-2 break-all text-several-light">{authUser.email}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={selectImage} />
              <button type="button" disabled={imageLoading} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white disabled:opacity-50">
                <Camera size={17} /> {authUser.profileImageUrl ? "Cambiar foto" : "Subir foto"}
              </button>
              {authUser.profileImageUrl && (
                <button type="button" disabled={imageLoading} onClick={() => void removeImage()} className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-5 py-3 font-semibold text-red-300 disabled:opacity-50">
                  <ImageMinus size={17} /> Eliminar foto
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-several-light">JPG, PNG o WEBP; hasta 10 MB.</p>
            {imageError && <p role="alert" className="mt-2 text-sm text-red-300">{imageError}</p>}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {authUser.userRoles.map((role) => <span key={role} className="rounded-full border border-high-enfasis/30 px-3 py-1 text-xs font-semibold text-high-enfasis">{role.replaceAll("_", " ")}</span>)}
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-several-light">
          {roles}. Administra la información de inicio de sesión y protege tu cuenta desde la sección de seguridad.
        </p>
        <Link to="/settings" className="mt-6 inline-flex rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white">Administrar cuenta</Link>
      </header>
      {!authUser.userId && (
        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-several-light">
          No se recibió el identificador de usuario requerido por algunas acciones de escritura y biblioteca. Actualiza la sesión o inténtalo más tarde.
        </p>
      )}
    </main>
  );
}
