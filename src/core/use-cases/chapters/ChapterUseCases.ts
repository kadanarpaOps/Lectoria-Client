import { createChapterRequest, deleteChapterRequest, getChaptersByStoryRequest, getOwnedChaptersByStoryRequest, toggleChapterStatusRequest, updateChapterRequest } from "../../../infrastructure/api/requests/chapters/chapters.request";
import type { PageResponse } from "../../domain/models/common/PaginationModels";
import type { ChapterInfo, ChaptersFilters, RegisterChapter, UpdateChapter } from "../../domain/models/chapters/ChapterModel";
import type { ChapterPort } from "../../domain/ports/chapters/ChapterPort";

export class ChapterService implements ChapterPort {

  async getChaptersByStory(filters: ChaptersFilters, storyId: string): Promise<PageResponse<ChapterInfo>> {
    const response = await getChaptersByStoryRequest(filters, storyId);
    return response;
  }

  async getOwnedChaptersByStory(filters: ChaptersFilters, storyId: string): Promise<PageResponse<ChapterInfo>> {
    const response = await getOwnedChaptersByStoryRequest(filters, storyId);
    return response;
  }

  async createChapter(createChapter: RegisterChapter): Promise<void> {
    const response = await createChapterRequest(createChapter);
    return response;
  }

  async updateChapter(updateChapter: UpdateChapter, chapterId: string): Promise<void> {
    const response = await updateChapterRequest(chapterId, updateChapter);
    return response;
  }

  async toggleChapterStatus(chapterId: string): Promise<void> {
    const response = await toggleChapterStatusRequest(chapterId);
    return response;
  }

  async deleteChapter(storyId: string, chapterId: string): Promise<void> {
    const response = await deleteChapterRequest(storyId, chapterId);
    return response;
  }

}
