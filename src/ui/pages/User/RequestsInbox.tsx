import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getMyRequests, respondToRequest, type UserRequest } from "../../../infrastructure/api/requests/requests.request";
import { useNavigate } from "react-router";

export default function RequestsInbox() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequests(await getMyRequests());
      setError(null);
    } catch {
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { if (authUser) void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [authUser, load]);

  const respond = async (request: UserRequest, accept: boolean) => {
    try {
      await respondToRequest(request.id, accept);
      await load();
    } catch {
      setError("No se pudo responder la solicitud.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-high-enfasis">Colaboración</p>
        <h1 className="mt-2 text-3xl font-bold text-global sm:text-4xl">Solicitudes</h1>
      </header>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
      {loading ? <div className="flex min-h-40 justify-center pt-12"><div className="loading-button" /></div> : requests.length ? (
        <div className="space-y-3">
          {requests.map((request) => {
            const incoming = request.targetUserId === authUser?.userId;
            return (
              <article key={request.id} className="rounded-2xl border border-toolbar-bg/15 bg-surface-container-low p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-global">
                      {request.type === "COAUTHOR_REQUEST"
                        ? request.coauthorUserId === request.sourceUserId
                          ? `${request.sourceUsername ?? "Un usuario"} solicita ser coautor`
                          : `${request.sourceUsername ?? "Un usuario"} te invita como coautor`
                        : "Solicitud de reactivación"}
                    </h2>
                    {request.storyId && <button type="button" onClick={() => navigate(`/explore/story/${request.storyId}`)} className="mt-1 cursor-pointer text-sm text-high-enfasis hover:underline">Abrir historia</button>}
                    <p className="mt-1 text-xs text-several-light">Estado: {request.status === "PENDING" ? "Pendiente" : request.status === "ACCEPTED" ? "Aceptada" : "Rechazada"} · {new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                  {incoming && request.status === "PENDING" && request.type === "COAUTHOR_REQUEST" && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void respond(request, true)} className="cursor-pointer rounded-xl bg-high-enfasis px-4 py-2 font-semibold text-white transition hover:opacity-90 active:scale-95">Aceptar</button>
                      <button type="button" onClick={() => void respond(request, false)} className="cursor-pointer rounded-xl border border-toolbar-bg/20 px-4 py-2 text-global transition hover:bg-global/5 active:scale-95">Rechazar</button>
                    </div>
                  )}
                  {!incoming && request.type === "COAUTHOR_REQUEST" && <p className="text-sm text-several-light">Esperando respuesta</p>}
                </div>
              </article>
            );
          })}
        </div>
      ) : <p className="rounded-2xl border border-dashed border-toolbar-bg/20 p-8 text-center text-several-light">No tienes solicitudes.</p>}
    </main>
  );
}
