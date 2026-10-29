
export const getLastModifiedTime = (dateObj: Date): string => {
  const date = new Date(dateObj);
  const now = new Date();
  
  const diffInMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `Hace ${seconds} segundos`;
  if (minutes < 60) return `Hace ${minutes} minutos`;
  if (hours < 24) return `Hace ${hours} horas`;

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};
