
export interface ChapterInfo {
  id: string;
  order: number;
  title: string;
  storyId: string;
  content: string;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterChapter {
  storyId: string;
}

export interface UpdateChapter {
  title: string;
  content: string;
}

export interface ChaptersFilters {
  offset: number;
  limit: number;
  newestFirst: boolean;
}

// Web Models

export interface EditingChapter {
  id: string;
  order: string;
  title: string;
  content: string;
  hidden: boolean;
  updatedAt: Date;
}

export interface ReadingChapter {
  id: string;
  lastActivity: string;
}
