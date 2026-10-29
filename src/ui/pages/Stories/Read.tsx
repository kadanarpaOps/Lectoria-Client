import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import type { ChapterInfo } from "../../../core/domain/models/chapters/ChapterModel";
import { parseTiptapContent, renderWithFormat } from "../utils/renderTiptap.util";
import CommentsSection from "../../components/stories/CommentsSection";

const Read = () => {

  // Use Location
  const location = useLocation();

  // Load or Recovery Story
  const [ readingChapter, setReadingChapter ] = useState<ChapterInfo | null>(null);

  const chapterToRead = location.state?.chapterToRead as ChapterInfo || null;

  // Use Effect Load Chapter to Read
  useEffect(() => {
    const loadChapterToRead = () => {
      if (chapterToRead) {
        setReadingChapter(chapterToRead);
      }
    };
    loadChapterToRead();
  }, [chapterToRead]);

  return (
    <main className="grow flex flex-col items-center px-4 sm:px-8 lg:px-12 pb-12 writing-canvas">
      { readingChapter ? (
        <>
          <div
            className="text-3xl sm:text-5xl font-bold text-global min-h-fit w-full max-w-3xl break-words"
          >
            <div
              dangerouslySetInnerHTML={{ __html: renderWithFormat(parseTiptapContent(readingChapter.title)) }}
            ></div>
          </div>
          <div
            className="min-h-fit w-full max-w-3xl break-words"
            dangerouslySetInnerHTML={{ __html: renderWithFormat(parseTiptapContent(readingChapter.content)) }}
          ></div>
          <div className="w-full max-w-3xl mt-12">
            <CommentsSection key={readingChapter.id} chapterId={readingChapter.id} title="Comentarios del capítulo" />
          </div>
        </>
      ) : (
        <h1 className="text-3xl">No estás leyendo nada</h1>
      )}
    </main>
  )
}

export default Read