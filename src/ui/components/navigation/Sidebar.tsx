import { BookCopy, CircleUserRound, Compass, Settings, SquarePen, UsersRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router"
import { useAuth } from "../../hooks/useAuth";

type SidebarProps= {
  isSidebarOpen: boolean,
}

const Sidebar = ({ isSidebarOpen }: SidebarProps) => {

  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();

  return (
    <aside className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out overflow-hidden`}>
      <nav className={`${isSidebarOpen ? "min-w-64 p-6": "w-0"} transition-all duration-300 ease-in-out overflow-hidden fixed h-full border-r border-inputs-bg/15 bg-background-global flex flex-col z-50`}>
        <div className="text-3xl font-bold tracking-tighter text-high-enfasis mb-8">
          Lectoria
        </div>
        <div className="flex-1 space-y-3">
          <a
            className={"flex items-center space-x-3 py-4 px-4 ".concat(
            location.pathname.includes("/explore")
            ? "text-high-enfasis bg-high-enfasis/10 rounded-r-full border-l-4 border-high-enfasis cursor-default"
            : "text-several-light hover:bg-several-light/10 hover:rounded-r-full hover:border-l-4 border-several-light transition-all duration-100 cursor-pointer")}
            onClick={() => navigate("/explore")}
          >
            <Compass size={26} />
            <span>Explorar</span>
          </a>
          <a
            className={"flex items-center space-x-3 py-4 px-4 ".concat(
            location.pathname.includes("/library")
            ? "text-high-enfasis bg-high-enfasis/10 rounded-r-full border-l-4 border-high-enfasis cursor-default"
            : "text-several-light hover:bg-several-light/10 hover:rounded-r-full hover:border-l-4 border-several-light transition-all duration-100 cursor-pointer")}
            onClick={() => navigate("/library")}
          >
            <BookCopy size={26} />
            <span>Mi Biblioteca</span>
          </a>
          <a
            className={"flex items-center space-x-3 py-4 px-4 ".concat(
            location.pathname.includes("/write")
            ? "text-high-enfasis bg-high-enfasis/10 rounded-r-full border-l-4 border-high-enfasis cursor-default"
            : "text-several-light hover:bg-several-light/10 hover:rounded-r-full hover:border-l-4 border-several-light transition-all duration-100 cursor-pointer")}
            onClick={() => navigate("/write")}
          >
            <SquarePen size={26} />
            <span>Escribir</span>
          </a>
          <a
            className={"flex items-center space-x-3 py-4 px-4 ".concat(
            location.pathname.includes("/profile")
            ? "text-high-enfasis bg-high-enfasis/10 rounded-r-full border-l-4 border-high-enfasis cursor-default"
            : "text-several-light hover:bg-several-light/10 hover:rounded-r-full hover:border-l-4 border-several-light transition-all duration-100 cursor-pointer")}
            onClick={() => navigate("/profile")}
          >
            <CircleUserRound size={26} />
            <span>Mi Cuenta</span>
          </a>
          {authUser && (
            <a
              className={"flex items-center space-x-3 py-4 px-4 ".concat(
              location.pathname === "/users"
              ? "text-high-enfasis bg-high-enfasis/10 rounded-r-full border-l-4 border-high-enfasis cursor-default"
              : "text-several-light hover:bg-several-light/10 hover:rounded-r-full hover:border-l-4 border-several-light transition-all duration-100 cursor-pointer")}
              onClick={() => navigate("/users")}
            >
              <UsersRound size={26} />
              <span>Comunidad</span>
            </a>
          )}
          {authUser?.userRoles.includes("LECTORIA_ADMIN") && (
            <a className="flex items-center space-x-3 py-4 px-4 text-several-light transition-all hover:bg-several-light/10" onClick={() => navigate("/admin/users")}>
              <UsersRound size={26} />
              <span>Administración</span>
            </a>
          )}
          {authUser && (
            <a className="flex cursor-pointer items-center space-x-3 py-4 px-4 text-several-light transition-all hover:bg-several-light/10" onClick={() => navigate("/settings")}>
              <Settings size={24} /><span>Seguridad</span>
            </a>
          )}
        </div>
        <div className="mt-auto border-t border-inputs-bg/15">
          { authUser ? (
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
                  {authUser.userRoles.includes("LECTORIA_WRITER") ? (
                    "Escritor"
                  ) : (
                    "Administrador"
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex mt-6 items-center justify-center">
              { !loading && !authUser ? (
                <button
                  className="w-full bg-primary-container text-on-primary-fixed font-bold py-2 cursor-pointer rounded-xl hover:scale-[0.98] transition-all"
                  onClick={() => {
                    const authAction = "LOGIN";
                    navigate("/auth", {
                      state: { authAction }
                    });
                  }}
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
  )
}

export default Sidebar