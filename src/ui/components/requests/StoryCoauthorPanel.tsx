import { useCallback, useEffect, useState } from "react";
import { UserRoundPlus, X } from "lucide-react";
import { getStoryCoauthors, inviteCoauthor, removeStoryCoauthor, type Coauthor } from "../../../infrastructure/api/requests/requests.request";

type Props = { storyId: string; onClose: () => void };

export default function StoryCoauthorPanel({ storyId, onClose }: Props) {
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCoauthors(await getStoryCoauthors(storyId));
      setError(null);
    } catch {
      setError("No se pudo cargar la lista de coautores.");
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim()) return;
    setBusy(true);
    try {
      await inviteCoauthor(storyId, username.trim());
      setUsername("");
      setError(null);
    } catch {
      setError("No se pudo enviar la invitación. Verifica el usuario o si ya hay una solicitud pendiente.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (userId: string) => {
    setBusy(true);
    try {
      await removeStoryCoauthor(storyId, userId);
      await load();
    } catch {
      setError("No se pudo quitar a este coautor.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="coauthors-title">
      <section className="w-full max-w-xl rounded-3xl border border-toolbar-bg/20 bg-background-global p-5 shadow-2xl sm:p-7">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-high-enfasis">Colaboración</p>
            <h2 id="coauthors-title" className="mt-1 text-2xl font-bold text-global">Gestionar coautores</h2>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full p-2 text-several-light transition hover:bg-global/10 hover:text-global active:scale-90" aria-label="Cerrar">
            <X />
          </button>
        </header>
        <form onSubmit={(event) => void invite(event)} className="flex flex-col gap-2 sm:flex-row">
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Nombre de usuario" className="min-w-0 flex-1 rounded-xl bg-inputs-bg px-4 py-3 text-global outline-none focus:ring-2 focus:ring-high-enfasis" />
          <button type="submit" disabled={busy || !username.trim()} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-high-enfasis px-4 py-3 font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
            <UserRoundPlus size={18} /> Invitar
          </button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        <h3 className="mb-2 mt-6 font-semibold text-global">Coautores actuales</h3>
        {loading ? <div className="flex justify-center py-8"><div className="loading-button" /></div> : coauthors.length ? (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {coauthors.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                <span className="min-w-0 truncate text-sm text-global">{item.username}</span>
                <button type="button" disabled={busy} onClick={() => void remove(item.userId)} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 active:scale-95 disabled:opacity-50">
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-xl bg-surface-container-low p-4 text-sm text-several-light">Aún no hay coautores.</p>}
      </section>
    </div>
  );
}
