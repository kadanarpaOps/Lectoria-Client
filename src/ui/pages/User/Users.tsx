import { useCallback, useEffect, useRef, useState } from "react";
import { Search, UserRound, UsersRound } from "lucide-react";
import { UserService } from "../../../core/use-cases/UserUseCases";
import type { UserDirectoryEntry } from "../../../core/domain/models/users/UserDirectoryModel";
import { useLocation, useNavigate } from "react-router";
import { isAxiosError } from "axios";
import PageNavigator from "../../components/navigation/PageNavigator";

const userService = new UserService();
const PAGE_SIZE = 10;
const DIRECTORY_STATE_KEY = "lectoria-community-directory-state";

interface DirectoryState {
  page: number;
  username: string;
  email: string;
  usernameFilter: string;
  emailFilter: string;
  scrollY: number;
}

function getRestoredDirectoryState(): DirectoryState | null {
  try {
    const stored = sessionStorage.getItem(DIRECTORY_STATE_KEY);
    if (!stored) return null;
    sessionStorage.removeItem(DIRECTORY_STATE_KEY);
    const state = JSON.parse(stored) as Partial<DirectoryState>;
    if (
      Number.isInteger(state.page) && (state.page ?? -1) >= 0
      && typeof state.username === "string"
      && typeof state.email === "string"
      && typeof state.usernameFilter === "string"
      && typeof state.emailFilter === "string"
      && typeof state.scrollY === "number"
    ) {
      return state as DirectoryState;
    }
  } catch {
    // Keep the directory usable if storage is blocked or contains invalid data.
  }
  return null;
}

export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const [restoredState] = useState(getRestoredDirectoryState);
  const restoredScrollY = useRef<number | null>(restoredState?.scrollY ?? null);
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [page, setPage] = useState(restoredState?.page ?? 0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [username, setUsername] = useState(restoredState?.username ?? "");
  const [email, setEmail] = useState(restoredState?.email ?? "");
  const [usernameFilter, setUsernameFilter] = useState(restoredState?.usernameFilter ?? "");
  const [emailFilter, setEmailFilter] = useState(restoredState?.emailFilter ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.pageUsers(page, PAGE_SIZE, usernameFilter, emailFilter);
      setUsers(result.data);
      setTotalPages(result.metaData.totalPages);
      setTotalItems(result.metaData.totalItems);
    } catch (requestError) {
      const message = isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : null;
      setError(message || "No se pudo cargar el directorio de usuarios. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [emailFilter, page, usernameFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  useEffect(() => {
    if (loading || restoredScrollY.current === null) return;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: restoredScrollY.current ?? 0, behavior: "auto" });
      restoredScrollY.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, users]);

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setUsernameFilter(username.trim());
    setEmailFilter(email.trim());
  };

  const resetFilters = () => {
    setUsername("");
    setEmail("");
    setUsernameFilter("");
    setEmailFilter("");
    setPage(0);
  };

  const openUserProfile = (userId: string) => {
    try {
      sessionStorage.setItem(DIRECTORY_STATE_KEY, JSON.stringify({
        page,
        username,
        email,
        usernameFilter,
        emailFilter,
        scrollY: window.scrollY,
      } satisfies DirectoryState));
    } catch {
      // The profile remains accessible even when browser storage is unavailable.
    }
    navigate(`/users/${userId}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      <header className="mb-8 rounded-3xl border border-toolbar-bg/10 bg-background-global p-5 sm:p-7">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-high-enfasis"><UsersRound size={17} /> Comunidad</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-global">Usuarios de Lectoria</h1>
        <p className="mt-3 text-several-light">Encuentra lectores y escritores por nombre o correo.</p>
        <form onSubmit={applyFilters} className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <label className="flex items-center gap-2 rounded-xl bg-inputs-bg px-4 py-3">
            <Search size={17} className="shrink-0 text-several-light" />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Buscar por nombre" className="w-full bg-transparent text-global outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-inputs-bg px-4 py-3">
            <Search size={17} className="shrink-0 text-several-light" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Buscar por correo" className="w-full bg-transparent text-global outline-none" />
          </label>
          <button type="submit" className="rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white">Buscar</button>
          <button type="button" onClick={resetFilters} className="rounded-full border border-toolbar-bg/15 px-5 py-3 font-semibold text-global">Limpiar</button>
        </form>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between text-sm text-several-light">
          <span>{totalItems} usuarios</span>
          <span>Página {page + 1} de {Math.max(totalPages, 1)}</span>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
        {loading ? (
          <div className="py-16 text-center text-several-light">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-toolbar-bg/20 p-10 text-center text-several-light">No hay resultados para mostrar.</div>
        ) : users.map((user) => (
          <button
            type="button"
            key={user.userId}
            onClick={() => openUserProfile(user.userId)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-3xl border border-toolbar-bg/10 bg-background-global p-4 text-left transition-all hover:border-high-enfasis/30 hover:bg-high-enfasis/5 active:scale-[0.99] sm:gap-4 sm:p-5"
            aria-label={`Ver perfil de ${user.username}`}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-inputs-bg">
              {user.profileImageUrl
                ? <img src={user.profileImageUrl} alt={`Perfil de ${user.username}`} className="h-full w-full object-cover" />
                : <UserRound className="text-several-light" size={25} />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-global">{user.username}</h2>
              <p className="mt-1 text-sm text-several-light">Ver perfil e historias</p>
            </div>
          </button>
        ))}
      </section>

      <PageNavigator page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}
