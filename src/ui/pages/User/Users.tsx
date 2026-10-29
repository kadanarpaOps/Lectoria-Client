import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, UserRound, UsersRound } from "lucide-react";
import { UserService } from "../../../core/use-cases/UserUseCases";
import type { UserDirectoryEntry } from "../../../core/domain/models/users/UserDirectoryModel";

const userService = new UserService();
const PAGE_SIZE = 10;

export default function Users() {
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
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
    } catch {
      setError("No se pudo cargar el directorio de usuarios. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [emailFilter, page, usernameFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

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
          <span>Página {page + 1} de {totalPages}</span>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
        {loading ? (
          <div className="py-16 text-center text-several-light">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-toolbar-bg/20 p-10 text-center text-several-light">No hay resultados para mostrar.</div>
        ) : users.map((user) => (
          <article key={user.userId} className="flex items-center gap-3 sm:gap-4 rounded-3xl border border-toolbar-bg/10 bg-background-global p-4 sm:p-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-inputs-bg">
              {user.userDetails?.profileImageUrl
                ? <img src={user.userDetails.profileImageUrl} alt={`Perfil de ${user.username}`} className="h-full w-full object-cover" />
                : <UserRound className="text-several-light" size={25} />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-global">{user.username}</h2>
              <p className="break-all text-sm text-several-light">{user.email}</p>
              <p className="mt-1 text-xs text-high-enfasis">{user.userRoles.join(" · ")}</p>
            </div>
          </article>
        ))}
      </section>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-xl border border-toolbar-bg/10 p-3 text-global disabled:opacity-40" aria-label="Página anterior"><ChevronLeft /></button>
          <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} className="rounded-xl border border-toolbar-bg/10 p-3 text-global disabled:opacity-40" aria-label="Página siguiente"><ChevronRight /></button>
        </div>
      )}
    </main>
  );
}
