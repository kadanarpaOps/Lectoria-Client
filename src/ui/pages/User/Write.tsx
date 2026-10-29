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
import { useAuth } from '../../hooks/useAuth';

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

export default function Write() {

    // Use Navigate
    const navigate = useNavigate();
    // Use Location
    const location = useLocation();
    // Use Alerts
    const { showAlert } = useAlert();
    const { authUser } = useAuth();

    // Load or Recover Story
    const [ editingChapter, setEditingChapter ] = useState<EditingChapter | null>(null);
    const { updateChapter, error } = useChapters();

    const storageEditingChapter = localStorage.getItem("editingChapter");
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
            if (chapterToEdit && !storageEditingChapter) {
                {/** Casuística 3 */}
                localStorage.setItem('editingChapter', JSON.stringify(chapterToEdit));
                setEditingChapter(chapterToEdit);
            } else if (!chapterToEdit && storageEditingChapter) {
                {/** Casuística 2 */}
                const recoveredChapterEdition = JSON.parse(storageEditingChapter) as EditingChapter;
                setEditingChapter(recoveredChapterEdition);
            } else if (chapterToEdit && storageEditingChapter) {
                const recoveredChapterEdition = JSON.parse(storageEditingChapter) as EditingChapter;
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
    }, [chapterToEdit, storageEditingChapter]);

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
        onUpdate({ editor}) {
            if (editingChapter) {
                localStorage.setItem('editingChapter', JSON.stringify({ ...editingChapter, title: JSON.stringify(editor.getJSON()) }));
            }
        },
        editorProps: {
            attributes: {
                class: "text-5xl font-bold text-global outline-none min-h-fit",
            }
        },
        onFocus: () => setActiveEditor('title'),
        content: editingChapter?.title ? (editingChapter.title.trim().length > 0 ? JSON.parse(editingChapter.title) : editingChapter.title) : "",
    }, [editingChapter]);

    const editor = useEditor({
        extensions,
        onUpdate({ editor }) {
            setWordsCount(editor.storage.characterCount.words());
            if (editingChapter) {
                localStorage.setItem('editingChapter', JSON.stringify({ ...editingChapter, content: JSON.stringify(editor.getJSON()) }));
            }
        },
        onFocus: () => setActiveEditor('content'),
        content: editingChapter ? (editingChapter.content.trim().length > 0 ? JSON.parse(editingChapter.content) : editingChapter.content) : "",
    }, [editingChapter]);

    const handleChapterSave = async (): Promise<boolean> => {
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
            localStorage.removeItem('editingChapter');
            navigate(`/profile`, {state: {}, replace: true});
        }

        return success;
    }

    const setAnotherChapter = () => {
        setEditingChapter(chapterToEdit);
        localStorage.setItem('editingChapter', JSON.stringify(chapterToEdit));
    }

    const setCustomChapter = (chapter: EditingChapter) => {
        setEditingChapter(chapter);
        localStorage.setItem('editingChapter', JSON.stringify(chapter));
    }

    const handleSaveAndEditOtherChapter = async () => {
        const success = await handleChapterSave();
        if (success) {
            setAnotherChapter();
        }
    }

    if (!authUser?.userId) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-16">
                <section className="rounded-3xl border border-amber-400/20 bg-background-global p-8">
                    <h1 className="text-3xl font-bold text-global">Escribir en Lectoria</h1>
                    <p className="mt-4 text-several-light">La API de Lectoria no entrega el identificador que story-service necesita para crear y guardar capítulos vinculados a una cuenta.</p>
                </section>
            </main>
        );
    }

    {/** Casuística 1 */}
    if (!editingChapter && !chapterToEdit) {
        return (
            <LoadLastEditionModal setChapter={setCustomChapter} />
        );
    }

    return (
        <div className="grow flex flex-col items-center px-12 pb-12 writing-canvas">
            {editingChapter && chapterToEdit && (
                editingChapter.id !== chapterToEdit. id && (
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
            <Toolbar editor={activeEditor === 'title' ? titleEditor : editor} onSave={handleChapterSave} />
            <div className="w-full max-w-3xl grow">
                <div className="relative focus:outline-none">
                    <EditorContent editor={titleEditor} className='mb-10' />
                    <EditorContent editor={editor} className='leading-relaxed' />
                </div>
            </div>
            <SpeechReader editor={editor} />
            <div className="fixed bottom-8 right-12 flex items-center space-x-4 bg-search-bg/80 px-5 py-3 rounded-2xl ghost-border backdrop-opacity-95 shadow-2xl z-40">
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
