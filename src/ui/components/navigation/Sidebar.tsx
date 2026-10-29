import { BookCopy, CircleUserRound, Compass, Settings, SquarePen, UsersRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

type SidebarProps = {
  isSidebarOpen: boolean,
  isMobile: boolean,
  onClose: () => void,
}

const Sidebar = ({ isSidebarOpen, isMobile, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();
  const isAdmin = authUser?.userRoles.some((role) => String(role).includes("ADMIN")) ?? false;
  const navigationClass = (path: string) => `flex items-center space-x-3 py-4 px-4 ${
    (path === "/users" ? location.pathname === path : location.pathname.includes(path))
      ? "text-high-enfasis bg-high-enfasis/10 rounded-r-full border-l-4 border-high-enfasis cursor-default"
      : "text-several-light hover:bg-several-light/10 hover:rounded-r-full hover:border-l-4 border-several-light transition-all duration-100 cursor-pointer"
  }`;

  const navigateTo = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  return (
    <>
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50"
        />
      )}
      <aside className={`${!isMobile && isSidebarOpen ? "w-64" : "w-0"} shrink-0 transition-all duration-300 ease-in-out ${isMobile && isSidebarOpen ? "overflow-visible" : "overflow-hidden"}`}>
      <nav className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-inputs-bg/15 bg-background-global p-5 sm:p-6 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="text-3xl font-bold tracking-tighter text-high-enfasis mb-8">
          Lectoria
        </div>
        <div className="flex-1 space-y-3">
          {!isAdmin && (
            <>
              <a className={navigationClass("/explore")} onClick={() => navigateTo("/explore")}>
                <Compass size={26} />
                <span>Explorar</span>
              </a>
              <a className={navigationClass("/library")} onClick={() => navigateTo("/library")}>
                <BookCopy size={26} />
                <span>Mi Biblioteca</span>
              </a>
              <a className={navigationClass("/write")} onClick={() => navigateTo("/write")}>
                <SquarePen size={26} />
                <span>Escribir</span>
              </a>
            </>
          )}
          <a className={navigationClass("/profile")} onClick={() => navigateTo("/profile")}>
            <CircleUserRound size={26} />
            <span>Mi Cuenta</span>
          </a>
          {authUser && (
            <a className={navigationClass("/users")} onClick={() => navigateTo("/users")}>
              <UsersRound size={26} />
              <span>Comunidad</span>
            </a>
          )}
          {isAdmin && (
            <a className={navigationClass("/admin")} onClick={() => navigateTo("/admin/users")}>
              <UsersRound size={26} />
              <span>Administración</span>
            </a>
          )}
          {authUser && (
            <a className={navigationClass("/settings")} onClick={() => navigateTo("/settings")}>
              <Settings size={24} /><span>Seguridad</span>
            </a>
          )}
        </div>
        <div className="mt-auto border-t border-inputs-bg/15">
          {authUser ? (
            <div className="mt-6 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
                {authUser.profileImageUrl ? (
                  <img
                    src={authUser.profileImageUrl}
                    alt="Imágen de Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.userName)}&background=dcd7ba&color=16161d`}
                    alt="Imágen de Perfil"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-global">{authUser.userName}</p>
                <p className="text-xs text-several-light">
                  {authUser.userRoles.includes("LECTORIA_WRITER") ? "Escritor" : "Administrador"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex mt-6 items-center justify-center">
              {!loading && !authUser ? (
                <button
                  className="w-full bg-primary-container text-on-primary-fixed font-bold py-2 cursor-pointer rounded-xl hover:scale-[0.98] transition-all"
                  onClick={() => navigateTo("/auth")}
                >
                  Iniciar Sesión
                </button>
              ) : (
                <div className="flex items-center w-10 h-10">
                  <div className="loading-button" />
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      </aside>
    </>
  )
}

export default Sidebar
