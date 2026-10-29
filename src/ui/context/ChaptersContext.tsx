import { createContext } from "react";
import type { ChapterInfo, ChaptersFilters, RegisterChapter, UpdateChapter } from "../../core/domain/models/chapters/ChapterModel";
import type { PageResponse } from "../../core/domain/models/common/PaginationModels";

export interface ChaptersContextType {
  // Basics
  loading: boolean;
  updating: boolean
  error: string | null;
  // Rest Methods
  getChaptersByStory: (filters: ChaptersFilters, storyId: string) => Promise<PageResponse<ChapterInfo>>;
  getOwnedChaptersByStory: (filters: ChaptersFilters, storyId: string) => Promise<PageResponse<ChapterInfo>>;
  createChapter: (createChapter: RegisterChapter) => Promise<boolean>;
  updateChapter: (updateChapter: UpdateChapter, chapterId: string) => Promise<boolean>;
  toggleChapterStatus: (chapterId: string) => Promise<boolean>;
  deleteChapter: (storyId: string, chapterId: string) => Promise<boolean>;
}

export const ChaptersContext = createContext<ChaptersContextType | null>(null);
