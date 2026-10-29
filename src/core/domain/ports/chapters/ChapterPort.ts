import type { PageResponse } from "../../models/common/PaginationModels";
import type { ChapterInfo, ChaptersFilters, RegisterChapter, UpdateChapter } from "../../models/chapters/ChapterModel";

export interface ChapterPort {
  getChaptersByStory(filters: ChaptersFilters, storyId: string): Promise<PageResponse<ChapterInfo>>;
  getOwnedChaptersByStory(filters: ChaptersFilters, storyId: string): Promise<PageResponse<ChapterInfo>>;
  createChapter(createChapter: RegisterChapter): Promise<void>;
  updateChapter(updateChapter: UpdateChapter, chapterId: string): Promise<void>;
  toggleChapterStatus(chapterId: string): Promise<void>;
  deleteChapter(storyId: string, chapterId: string): Promise<void>;
}
