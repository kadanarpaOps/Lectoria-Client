import { useCallback, useEffect, useState } from "react";
import { Check, MailOpen } from "lucide-react";
import { useNavigate } from "react-router";
import { getAppNotifications, notificationReadStateChangedEvent, setAppNotificationReadState, type AppNotification } from "../../../infrastructure/api/requests/notifications.request";
import { useAuth } from "../../hooks/useAuth";

export default function Notifications() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAppNotifications(page);
      setItems(result.content);
      setTotalPages(result.totalPages);
      setError(null);
    } catch {
      setError("No fue posible cargar tus notificaciones. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (authUser) void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authUser, load]);

  const toggleRead = async (notification: AppNotification) => {
    try {
      await setAppNotificationReadState(notification.notificationId, !notification.shown);
      setItems((current) => current.map((item) => item.notificationId === notification.notificationId
        ? { ...item, shown: !notification.shown, shownAt: !notification.shown ? new Date().toISOString() : null }
        : item));
      window.dispatchEvent(new Event(notificationReadStateChangedEvent));
    } catch {
      setError("No fue posible actualizar el estado de la notificación.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-high-enfasis">Tu espacio</p>
        <h1 className="mt-2 text-3xl font-bold text-global sm:text-4xl">Notificaciones</h1>
      </header>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-toolbar-bg/20 bg-surface-container-low">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center"><div className="loading-button" /></div>
        ) : items.length ? items.map((item) => (
          <article key={item.notificationId} className={`flex items-start gap-4 border-b border-toolbar-bg/10 p-4 sm:p-5 ${item.shown ? "" : "bg-high-enfasis/5"}`}>
            <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.shown ? "bg-transparent" : "bg-high-enfasis"}`} />
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  const text = item.notificationContent.toLowerCase();
                  navigate(text.includes("reactivar su cuenta") ? "/admin/requests" : text.includes("solicitud") ? "/requests" : "/notifications");
                }}
                className="cursor-pointer text-left text-global hover:text-high-enfasis"
              >
                {item.notificationContent}
              </button>
              <time className="mt-2 block text-sm text-several-light" dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleString()}
              </time>
            </div>
            <button
              type="button"
              onClick={() => void toggleRead(item)}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-global transition hover:bg-high-enfasis/10 active:scale-95"
              aria-label={item.shown ? "Marcar como no leída" : "Marcar como leída"}
            >
              {item.shown ? <MailOpen size={18} /> : <Check size={18} />}
              <span className="hidden sm:inline">{item.shown ? "No leída" : "Marcar leída"}</span>
            </button>
          </article>
        )) : <p className="p-8 text-center text-several-light">Aún no tienes notificaciones.</p>}
      </section>
      {totalPages > 1 && (
        <nav className="mt-5 flex items-center justify-between" aria-label="Paginación de notificaciones">
          <button type="button" disabled={page === 0 || loading} onClick={() => setPage((current) => Math.max(0, current - 1))}
            className="rounded-xl bg-surface-container-high px-4 py-2 text-global transition hover:bg-high-enfasis/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
            Anteriores
          </button>
          <span className="text-sm text-several-light">{page + 1} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            className="rounded-xl bg-surface-container-high px-4 py-2 text-global transition hover:bg-high-enfasis/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
            Siguientes
          </button>
        </nav>
      )}
    </main>
  );
}
