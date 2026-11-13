import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder, CharacterCount } from '@tiptap/extensions';
import Toolbar from "../../components/writing/Toolbar";
import { useEffect, useState } from 'react';
import SpeechReader from '../../components/textToSpeech/SpeechReader';
import { useChapters } from '../../hooks/useChapters';
import { useLocation, useNavigate } from 'react-router';
import type { EditingChapter } from '../../../core/domain/models/chapters/ChapterModel';
import { useAlert } from '../../hooks/useAlert';
import SaveActualEditionModal from '../../components/writing/SaveActualEditionModal';
import LoadLastEditionModal from '../../components/writing/LoadLastEditionModal';
import { parseTiptapContent } from "../utils/renderTiptap.util";
import { acquireChapterLock, releaseChapterLock } from "../../../infrastructure/api/requests/requests.request";

const extensions = [
    TextStyleKit, StarterKit,
    TextAlign.configure({
        alignments: ['left', 'center', 'right', 'justify'],
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left'
    }),
    Placeholder.configure({
        placeholder: "Comienza tu historia...",
    }),
    CharacterCount.configure({
        mode: "nodeSize",
    })
];

const EDITING_CHAPTER_KEY = "editingChapter";

const readStoredChapter = (): EditingChapter | null => {
    const stored = localStorage.getItem(EDITING_CHAPTER_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored) as EditingChapter;
    } catch {
        return null;
    }
};

export default function Write() {

    // Use Navigate
    const navigate = useNavigate();
    // Use Location
    const location = useLocation();
    // Use Alerts
    const { showAlert } = useAlert();

    // Load or Recover Story
    const [ editingChapter, setEditingChapter ] = useState<EditingChapter | null>(null);
    const [ lockedChapterId, setLockedChapterId ] = useState<string | null>(null);
    const { updateChapter, error } = useChapters();

    useEffect(() => {
        const chapterId = editingChapter?.id;
        if (!chapterId) {
            return;
        }
        let disposed = false;
        const acquire = async () => {
            try {
                await acquireChapterLock(chapterId);
                if (disposed) {
                    await releaseChapterLock(chapterId);
                    return;
                }
                setLockedChapterId(chapterId);
            } catch {
                if (!disposed) {
                    setLockedChapterId(null);
                    showAlert("Este capítulo ya está siendo editado por otra persona.", 5000);
                    setEditingChapter(null);
                    localStorage.removeItem(EDITING_CHAPTER_KEY);
                    navigate("/profile", { replace: true });
                }
            }
        };
        void acquire();
        const heartbeat = window.setInterval(() => {
            void acquireChapterLock(chapterId).catch(() => {
                if (!disposed) {
                    setLockedChapterId(null);
                    showAlert("Se perdió el control de edición de este capítulo.", 5000);
                    navigate("/profile", { replace: true });
                }
            });
        }, 45_000);
        return () => {
            disposed = true;
            window.clearInterval(heartbeat);
            void releaseChapterLock(chapterId);
        };
    }, [editingChapter?.id, navigate, showAlert]);

    // Antes se leía localStorage en cada render: como cada tecla guarda el borrador, el texto
    // cambiaba, el useEffect de abajo se volvía a ejecutar y recreaba los editores (perdían el foco)
    const chapterToEdit = location.state?.chapterToEdit as EditingChapter || null;

    {/**
        Hay 5 casuísticas:
        PROBADA: Diga que no hay ultimo capitulo guardado, enviar a Mis Historias, Diga que hay ultimo capitulo guardado y setearlo en localStorage y editingChapter
            1. No se envía un chapterToEdit y no hay un chapter en localStorage
        PROBADA 2. No se envía un chapterToEdit y hay un chapter en localStorage
        PROBADA 3. Se envía un chapterToEdit y no hay un chapter en localStorage
        PROBADA 4.1. El chapterToEdit enviado tiene el mismo id que el chapter en localStorage
        PROBADA 4.2. El chapterToEdit enviado no tiene el mismo id que el chapter en localStorage
    */}

    useEffect(() => {
        const loadChapterToEdit = () => {
            const recoveredChapterEdition = readStoredChapter();
            if (chapterToEdit && !recoveredChapterEdition) {
                {/** Casuística 3 */}
                localStorage.setItem(EDITING_CHAPTER_KEY, JSON.stringify(chapterToEdit));
                setEditingChapter(chapterToEdit);
            } else if (!chapterToEdit && recoveredChapterEdition) {
                {/** Casuística 2 */}
                setEditingChapter(recoveredChapterEdition);
            } else if (chapterToEdit && recoveredChapterEdition) {
                if (recoveredChapterEdition.id !== chapterToEdit.id) {
                    {/** Casuística 4.2 */}
                    setEditingChapter(recoveredChapterEdition);
                    console.log("Load SaveActualEditionModal");
                } else {
                    {/** Casuística 4.1 */}
                    setEditingChapter(recoveredChapterEdition);
                }
            }
        }
        loadChapterToEdit();
    }, [chapterToEdit]);

    // Guarda el borrador mezclando con lo último guardado: así el título no borra el contenido
    // (y viceversa) cuando se escribe en los dos editores
    const persistDraft = (changes: Partial<EditingChapter>) => {
        if (!editingChapter) return;
        const stored = readStoredChapter();
        const base = stored?.id === editingChapter.id ? stored : editingChapter;
        localStorage.setItem(EDITING_CHAPTER_KEY, JSON.stringify({ ...base, ...changes }));
    };

    // Editor
    const [ wordsCount, setWordsCount ] = useState(0);
    const [ activeEditor, setActiveEditor ] = useState<'title' | 'content'>('content');

    const titleEditor = useEditor({
        extensions: [
            StarterKit.configure({ heading: false }),
            Placeholder.configure({ placeholder: 'Título...' }),
            TextAlign.configure({
                alignments: ['left', 'center', 'right', 'justify'],
                types: ['heading', 'paragraph'],
                defaultAlignment: 'left'
            }),
        ],
        onUpdate({ editor }) {
            persistDraft({ title: JSON.stringify(editor.getJSON()) });
        },
        editorProps: {
            attributes: {
                class: "text-3xl sm:text-5xl font-bold text-global outline-none min-h-fit break-words",
            }
        },
        onFocus: () => setActiveEditor('title'),
        content: editingChapter?.title ? parseTiptapContent(editingChapter.title) : "",
    // Solo se recrea el editor si cambia el capítulo, no cada vez que cambia el objeto
    }, [editingChapter?.id]);

    const editor = useEditor({
        extensions,
        onCreate({ editor }) {
            setWordsCount(editor.storage.characterCount.words());
        },
        onUpdate({ editor }) {
            setWordsCount(editor.storage.characterCount.words());
            persistDraft({ content: JSON.stringify(editor.getJSON()) });
        },
        onFocus: () => setActiveEditor('content'),
        content: editingChapter ? parseTiptapContent(editingChapter.content) : "",
    }, [editingChapter?.id]);

    const handleChapterSave = async (): Promise<boolean> => {
        if (!editingChapter || lockedChapterId !== editingChapter.id) {
            showAlert("Espera a que se confirme el control de edición antes de guardar.", 5000);
            return false;
        }
        const title = titleEditor?.getJSON();
        const titleFormatted = JSON.stringify(title);

        const content = editor?.getJSON();
        const contentFormatted = JSON.stringify(content);

        const success = await updateChapter(
            {
                title: titleFormatted,
                content: contentFormatted
            },
            editingChapter!.id
        );

        if (!success) {
            showAlert(error!, 5000);
        } else {
            showAlert("Capítulo guardado exitosamente", 5000, "SUCCESS");
            setEditingChapter(null);
            localStorage.removeItem(EDITING_CHAPTER_KEY);
            navigate(`/profile`, {state: {}, replace: true});
        }

        return success;
    }

    const setAnotherChapter = () => {
        setEditingChapter(chapterToEdit);
        localStorage.setItem(EDITING_CHAPTER_KEY, JSON.stringify(chapterToEdit));
    }

    const setCustomChapter = (chapter: EditingChapter) => {
        setEditingChapter(chapter);
        localStorage.setItem(EDITING_CHAPTER_KEY, JSON.stringify(chapter));
    }

    const handleSaveAndEditOtherChapter = async () => {
        const success = await handleChapterSave();
        if (success) {
            setAnotherChapter();
        }
    }

    {/** Casuística 1 */}
    if (!editingChapter && !chapterToEdit) {
        return (
            <LoadLastEditionModal setChapter={setCustomChapter} />
        );
    }

    return (
        <div className="grow flex flex-col items-center px-4 sm:px-8 lg:px-12 pb-28 sm:pb-12 writing-canvas min-w-0">
            {editingChapter && chapterToEdit && (
                editingChapter.id !== chapterToEdit.id && (
                    <SaveActualEditionModal
                        onDiscard={setAnotherChapter}
                        onSave={handleSaveAndEditOtherChapter}
                        onContinue={() => navigate(location.pathname, {state: {}, replace: true})}
                        toSaveChapter={editingChapter!}
                        toEditChapter={chapterToEdit}
                    />
                )
            )}
            

            {/** Barra de Herramientas */}
            <Toolbar editor={activeEditor === 'title' ? titleEditor : editor} onSave={handleChapterSave} formattingEnabled={activeEditor === 'content'} />
            <div className="w-full max-w-3xl grow">
                <div className="relative focus:outline-none">
                    <EditorContent editor={titleEditor} className='mb-10' />
                    <EditorContent editor={editor} className='leading-relaxed' />
                </div>
            </div>
            <SpeechReader editor={editor} />
            <div className="fixed bottom-3 right-3 sm:bottom-8 sm:right-6 lg:right-12 flex items-center space-x-3 sm:space-x-4 bg-search-bg/90 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl ghost-border backdrop-opacity-95 shadow-2xl z-40">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-several-light uppercase tracking-tighter">
                        Palabras
                    </span>
                    <span className="text-sm font-bold text-high-enfasis">
                        { wordsCount }
                    </span>
                </div>
                <div className="w-px h-6 bg-toolbar-bg"></div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-several-light uppercase tracking-tighter">
                        Lectura
                    </span>
                    <span className="text-sm font-bold text-global">
                        { Math.ceil(wordsCount / 200) } min
                    </span>
                </div>
                <div className="ml-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
        </div>
    );
}
