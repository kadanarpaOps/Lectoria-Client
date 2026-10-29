import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import type { ChapterInfo } from "../../../core/domain/models/chapters/ChapterModel";
import { renderWithFormat } from "../utils/renderTiptap.util";

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
    <main className="grow flex flex-col items-center px-12 pb-12 writing-canvas">
      { readingChapter ? (
        <>
          <div
            className="text-5xl font-bold text-global min-h-fit w-full max-w-3xl"
          >
            <div
              dangerouslySetInnerHTML={{ __html: renderWithFormat(JSON.parse(readingChapter.title)) }}
            ></div>
          </div>
          <div
            className="min-h-fit w-full max-w-3xl"
            dangerouslySetInnerHTML={{ __html: renderWithFormat(JSON.parse(readingChapter.content)) }}
          ></div>
        </>
      ) : (
        <h1 className="text-3xl">No estás leyendo nada</h1>
      )}
    </main>
  )
}

export default Read