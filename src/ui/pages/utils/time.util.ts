type ApiDate = Date | string | number | null | undefined;

// El backend envía LocalDateTime sin zona ("2026-11-08T13:06:00"). Se interpreta en la zona del backend (America/Bogotá)
// para que "hace X" no dependa de la zona del navegador. Lo robusto sería que el backend
// enviara el offset explícito ("...Z" o "...-05:00"), que es lo que se respeta si viene.
const ASSUMED_API_TIME_ZONE = "-05:00";
const ISO_DATE_WITHOUT_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

const normalizeApiDateString = (value: string): string => {
  // Se cambia el espacio por "T" porque Safari no entiende "2026-11-08 13:06:00"
  const normalized = value.trim().replace(" ", "T");
  return ISO_DATE_WITHOUT_ZONE.test(normalized) ? `${normalized}${ASSUMED_API_TIME_ZONE}` : normalized;
};

/**
 * Convierte la fecha que llega del backend en un Date válido.
 * - "2026-11-08T18:06:00Z" / "...-05:00": formato ISO con zona (historias, capítulos, comentarios).
 * - "2026-11-08T13:06:00": sin zona; se asume -05:00 (Bogotá, ver ASSUMED_API_TIME_ZONE).
 * Devuelve null si la fecha no existe o no es válida, para no mostrar "Invalid Date".
 */
export const parseApiDate = (value: ApiDate): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date
    ? value
    : new Date(typeof value === "string" ? normalizeApiDateString(value) : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const timeAgo = (value: number, singular: string, pluralWord: string) =>
  `Hace ${value} ${value === 1 ? singular : pluralWord}`;

export const getLastModifiedTime = (value: ApiDate): string => {
  const date = parseApiDate(value);
  if (!date) return "Nunca";

  // Math.max evita "Hace -18000 segundos" si la fecha llega adelantada (zona horaria o reloj del equipo)
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Hace un momento";
  if (minutes < 60) return timeAgo(minutes, "minuto", "minutos");
  if (hours < 24) return timeAgo(hours, "hora", "horas");
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};
