import { useCallback, useEffect, useState } from "react";
import { beginAccountReactivation, getPendingReactivationRequests, type AdminReactivationRequest } from "../../../infrastructure/api/requests/requests.request";

export default function AdminRequests() {
  const [requests, setRequests] = useState<AdminReactivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequests(await getPendingReactivationRequests());
      setError(null);
    } catch {
      setError("No se pudieron cargar las solicitudes pendientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const start = async (request: UserRequest) => {
    setBusyId(request.id);
    try {
      await beginAccountReactivation(request.id);
      await load();
    } catch {
      setError("No se pudo iniciar la reactivación. Verifica si ya existe una verificación activa.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-high-enfasis">Administración</p>
        <h1 className="mt-2 text-3xl font-bold text-global">Solicitudes de reactivación</h1>
        <p className="mt-2 text-several-light">Al iniciar una solicitud, se enviará al usuario el código para completar la reactivación.</p>
      </header>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
      {loading ? <div className="flex min-h-40 justify-center pt-12"><div className="loading-button" /></div> : requests.length ? (
        <div className="space-y-3">
          {requests.map((request) => (
            <article key={request.id} className="flex flex-col gap-4 rounded-2xl border border-toolbar-bg/15 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h2 className="font-semibold text-global">Reactivación solicitada por {request.username}</h2>
                <p className="mt-1 break-all text-sm text-several-light">{request.userEmail}</p>
                <p className="mt-1 text-xs text-several-light">{new Date(request.createdAt).toLocaleString()}</p>
              </div>
              <button type="button" disabled={busyId === request.id} onClick={() => void start(request)} className="cursor-pointer rounded-xl bg-high-enfasis px-5 py-3 font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-wait disabled:opacity-50">
                {busyId === request.id ? "Enviando código..." : "Solicitar reactivación"}
              </button>
            </article>
          ))}
        </div>
      ) : <p className="rounded-2xl border border-dashed border-toolbar-bg/20 p-8 text-center text-several-light">No hay solicitudes pendientes.</p>}
    </main>
  );
}
