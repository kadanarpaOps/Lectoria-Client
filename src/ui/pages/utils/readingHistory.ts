export type ReadingHistoryEntry = {
  chapterId: string;
  storyId: string;
  chapterOrder: number;
  chapterTitle: string;
  storyTitle: string;
  storyAuthor: string;
  progress: number;
  positionProgress: number;
  scrollPosition: number;
  scrollExtent: number;
  lastReadAt: string;
};

const historyKey = (userId: string | null) => `lectoria:reading-history:${userId ?? "guest"}`;

const isReadingHistoryEntry = (entry: unknown): entry is ReadingHistoryEntry => {
  if (typeof entry !== "object" || entry === null) return false;
  const value = entry as Partial<ReadingHistoryEntry>;
  return typeof value.chapterId === "string" &&
    typeof value.storyId === "string" &&
    typeof value.chapterOrder === "number" &&
    typeof value.chapterTitle === "string" &&
    typeof value.storyTitle === "string" &&
    typeof value.storyAuthor === "string" &&
    typeof value.progress === "number" &&
    typeof value.positionProgress === "number" &&
    typeof value.scrollPosition === "number" &&
    typeof value.scrollExtent === "number" &&
    typeof value.lastReadAt === "string";
};

export const getReadingHistory = (userId: string | null): ReadingHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(historyKey(userId));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReadingHistoryEntry)
      .sort((a, b) => Date.parse(b.lastReadAt) - Date.parse(a.lastReadAt));
  } catch {
    return [];
  }
};

export const saveReadingProgress = (
  userId: string | null,
  entry: ReadingHistoryEntry,
  preserveFurthestProgress = true,
) => {
  const history = getReadingHistory(userId);
  const existing = history.find((item) => item.chapterId === entry.chapterId);
  const updated = {
    ...existing,
    ...entry,
    progress: preserveFurthestProgress
      ? Math.max(existing?.progress ?? 0, entry.progress)
      : entry.progress,
  };
  const next = [updated, ...history.filter((item) => item.chapterId !== entry.chapterId)].slice(0, 100);
  localStorage.setItem(historyKey(userId), JSON.stringify(next));
};

export const getChapterProgress = (userId: string | null, chapterId: string) =>
  getReadingHistory(userId).find((entry) => entry.chapterId === chapterId) ?? null;
