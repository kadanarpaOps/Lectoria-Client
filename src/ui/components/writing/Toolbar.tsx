import { Bold, ChevronDown, Italic, TextAlignCenter, TextAlignEnd, TextAlignJustify, TextAlignStart, Underline } from "lucide-react";
import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'

import { menuBarStateSelector } from "../../../infrastructure/api/config/menu.bar.state";

const Toolbar = ({ editor, onSave }: { editor: Editor, onSave(): void }) => {

  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  })

  return (
        <div className="sticky top-24 z-30 w-full max-w-4xl bg-search-bg/90 backdrop-opacity-95 rounded-2xl p-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-12">
            <div className="flex items-center space-x-1">
                {/** Font Selector */}
                <div className="relative group px-3 border-r border-toolbar-bg/30">
                    <button className="flex items-center cursor-pointer space-x-2 text-sm text-global py-1.5 px-2 hover:bg-toolbar-bg/50 rounded transition-all">
                        <span>Serif (Clásica)</span>
                        <ChevronDown size={20} />
                    </button>
                </div>
                {/** Formatting Options */}
                <div className="flex items-center px-2 space-x-1 border-r border-toolbar-bg/30">
                    <button
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      disabled={!editorState.canBold}
                      className={`w-10 h-10 flex items-center rounded-lg justify-center
                        ${editorState.canBold ? "cursor-pointer" : "cursor-default"}
                        ${editorState.isBold ? "bg-high-enfasis text-background-global transition-transform hover:scale-90" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global duration-300 transition-all"}`}
                    >
                        <Bold size={20} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      disabled={!editorState.canItalic}
                      className={`w-10 h-10 flex items-center rounded-lg justify-center
                        ${editorState.canItalic ? "cursor-pointer" : "cursor-default"}
                        ${editorState.isItalic ? "bg-high-enfasis text-background-global transition-transform hover:scale-90" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global duration-300 transition-all"}`}
                    >
                        <Italic size={20} />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().toggleUnderline().run()}
                      disabled={!editorState.canUnderline}
                      className={`w-10 h-10 flex items-center rounded-lg justify-center
                        ${editorState.canUnderline ? "cursor-pointer" : "cursor-default"}
                        ${editorState.isUnderline ? "bg-high-enfasis text-background-global transition-transform hover:scale-90" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global duration-300 transition-all"}`}
                    >
                        <Underline size={20} />
                    </button>
                </div>
                {/** Alignment Options */}
                <div className="flex items-center px-2 space-x-1">
                    <button
                      onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                      disabled={!editorState.canLeft}
                      className={`w-10 h-10 flex items-center rounded-lg justify-center
                        ${editorState.canLeft ? "cursor-pointer" : "cursor-default"}
                        ${editorState.isLeft ? "bg-high-enfasis text-background-global transition-transform hover:scale-90" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global duration-300 transition-all"}`}
                    >
                        <TextAlignStart size={20} />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                      disabled={!editorState.canCenter}
                      className={`w-10 h-10 flex items-center rounded-lg justify-center
                        ${editorState.canCenter ? "cursor-pointer" : "cursor-default"}
                        ${editorState.isCentered ? "bg-high-enfasis text-background-global transition-transform hover:scale-90" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global duration-300 transition-all"}`}
                    >
                        <TextAlignCenter size={20} />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                      disabled={!editorState.canRight}
                      className={`w-10 h-10 flex items-center rounded-lg justify-center
                        ${editorState.canRight ? "cursor-pointer" : "cursor-default"}
                        ${editorState.isRight ? "bg-high-enfasis text-background-global transition-transform hover:scale-90" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global duration-300 transition-all"}`}
                    >
                        <TextAlignEnd size={20} />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                      disabled={!editorState.canJustify}
                      className={`w-10 h-10 flex items-center rounded-lg justify-center
                        ${editorState.canJustify ? "cursor-pointer" : "cursor-default"}
                        ${editorState.isJustified ? "bg-high-enfasis text-background-global transition-transform hover:scale-90" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global duration-300 transition-all"}`}
                    >
                        <TextAlignJustify size={20} />
                    </button>
                </div>
            </div>
            <button
                onClick={() => {
                    onSave();
                }}
                className="bg-high-enfasis cursor-pointer text-background-global px-6 py-2 rounded-xl font-bold text-sm tracking-tight hover:scale-95 transition-all"
            >
                Guardar
            </button>
        </div>
  )
}

export default Toolbar