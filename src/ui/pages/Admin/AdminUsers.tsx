import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Shield, UserRound } from "lucide-react";
import { AdminService } from "../../../core/use-cases/AdminUseCases";
import type { AdminUserModel } from "../../../core/domain/models/admin/AdminModel";

const adminService = new AdminService();
const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserModel[]>([]);
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
      const result = await adminService.pageUsers(page, PAGE_SIZE, usernameFilter, emailFilter);
      setUsers(result.data);
      setTotalPages(result.metaData.totalPages);
      setTotalItems(result.metaData.totalItems);
    } catch {
      setError("No se pudo cargar el listado de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [emailFilter, page, usernameFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const changeRole = async (user: AdminUserModel, role: string, add: boolean) => {
    if (!user.userId) return;
    try {
      if (add) await adminService.addRole({ userId: user.userId, role });
      else await adminService.removeRole({ userId: user.userId, role });
      await loadUsers();
    } catch {
      setError("No se pudo actualizar el rol. Comprueba los permisos y vuelve a intentarlo.");
    }
  };

  const toggleStatus = async (user: AdminUserModel) => {
    if (!user.userId) return;
    try {
      await adminService.toggleUserStatus(user.userId);
      await loadUsers();
    } catch {
      setError("No se pudo cambiar el estado de la cuenta.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <header className="mb-8">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-high-enfasis"><Shield size={16} /> Administración</p>
        <h1 className="mt-2 text-3xl font-bold text-global">Usuarios de Lectoria</h1>
        <p className="mt-3 text-several-light">Consulta usuarios y gestiona sus roles y estado de cuenta.</p>
      </header>
      <form onSubmit={(event) => { event.preventDefault(); setPage(0); setUsernameFilter(username.trim()); setEmailFilter(email.trim()); }} className="mb-6 grid gap-3 rounded-3xl border border-toolbar-bg/10 bg-background-global p-5 md:grid-cols-[1fr_1fr_auto_auto]">
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Filtrar por usuario" className="rounded-xl bg-inputs-bg px-4 py-3 text-global outline-none focus:ring-2 focus:ring-high-enfasis" />
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Filtrar por correo" className="rounded-xl bg-inputs-bg px-4 py-3 text-global outline-none focus:ring-2 focus:ring-high-enfasis" />
        <button className="rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white">Buscar</button>
        <button type="button" onClick={() => { setUsername(""); setEmail(""); setUsernameFilter(""); setEmailFilter(""); setPage(0); }} className="rounded-full border border-toolbar-bg/15 px-5 py-3 font-semibold text-global">Limpiar</button>
      </form>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-sm text-several-light"><span>{totalItems} usuarios</span><span>Página {page + 1} de {totalPages}</span></div>
        {loading ? <div className="py-16 text-center text-several-light">Cargando usuarios...</div> : users.length === 0 ? <div className="rounded-3xl border border-dashed border-toolbar-bg/20 p-10 text-center text-several-light">No hay resultados.</div> : users.map((user) => {
          const roles = user.userRoles ?? [];
          return (
            <article key={user.userId} className="flex flex-col gap-5 rounded-3xl border border-toolbar-bg/10 bg-background-global p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-inputs-bg">
                  {user.userDetails?.profileImageUrl ? <img src={user.userDetails.profileImageUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="text-several-light" />}
                </div>
                <div>
                  <h2 className="font-semibold text-global">{user.username}</h2>
                  <p className="text-sm text-several-light">{user.email}</p>
                  <p className="mt-1 text-xs text-high-enfasis">{roles.join(", ") || "Sin roles"}</p>
                  <p className="mt-1 text-xs text-several-light">
                    Registro {user.userDetails?.registeredVerified ? "verificado" : "pendiente"}
                    {user.userDetails?.createdAt ? ` · ${new Date(user.userDetails.createdAt).toLocaleDateString("es-ES")}` : ""}
                  </p>
                  <p className={`mt-1 text-xs ${user.isEnabled ? "text-emerald-300" : "text-amber-300"}`}>
                    Cuenta {user.isEnabled ? "habilitada" : "deshabilitada"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["LECTORIA_ADMIN", "LECTORIA_LECTOR", "LECTORIA_WRITER"] as const).map((role) => {
                  const hasRole = roles.includes(role);
                  return (
                    <button key={role} disabled={!user.userId} onClick={() => void changeRole(user, role, !hasRole)} className="rounded-full border border-toolbar-bg/15 px-4 py-2 text-sm font-medium text-global disabled:cursor-not-allowed disabled:opacity-40">
                      {hasRole ? `Quitar ${role.replace("LECTORIA_", "").toLowerCase()}` : `Agregar ${role.replace("LECTORIA_", "").toLowerCase()}`}
                    </button>
                  );
                })}
                <button disabled={!user.userId} onClick={() => void toggleStatus(user)} className="rounded-full border border-toolbar-bg/15 px-4 py-2 text-sm font-medium text-global disabled:cursor-not-allowed disabled:opacity-40">
                  {user.isEnabled ? "Deshabilitar cuenta" : "Habilitar cuenta"}
                </button>
              </div>
            </article>
          );
        })}
      </section>
      {totalPages > 1 && <div className="mt-6 flex justify-center gap-3">
        <button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-xl border border-toolbar-bg/10 p-3 text-global disabled:opacity-40" aria-label="Página anterior"><ChevronLeft /></button>
        <button disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} className="rounded-xl border border-toolbar-bg/10 p-3 text-global disabled:opacity-40" aria-label="Página siguiente"><ChevronRight /></button>
      </div>}
    </main>
  );
}
