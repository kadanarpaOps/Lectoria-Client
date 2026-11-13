import { Bold, Heading1, Heading2, Heading3, Italic, TextAlignCenter, TextAlignEnd, TextAlignJustify, TextAlignStart, Underline } from "lucide-react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { menuBarStateSelector } from "../../../infrastructure/api/config/menu.bar.state";

const fontOptions = [
  { label: "Georgia · Literaria", value: "Georgia, serif" },
  { label: "Palatino · Clásica", value: '"Palatino Linotype", Palatino, serif' },
  { label: "Garamond · Editorial", value: "Garamond, serif" },
  { label: "Cambria · Lectura", value: "Cambria, Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Arial · Moderna", value: "Arial, sans-serif" },
  { label: "Verdana · Amplia", value: "Verdana, sans-serif" },
  { label: "Trebuchet · Suave", value: '"Trebuchet MS", sans-serif' },
  { label: "Tahoma · Compacta", value: "Tahoma, sans-serif" },
  { label: "Courier · Máquina", value: '"Courier New", monospace' },
];

const Toolbar = ({ editor, onSave, formattingEnabled = true }: { editor: Editor; onSave(): void; formattingEnabled?: boolean }) => {
  const editorState = useEditorState({ editor, selector: menuBarStateSelector });

  const headingOptions = [
    { level: 1 as const, Icon: Heading1, active: editorState.isHeading1, label: "Título principal" },
    { level: 2 as const, Icon: Heading2, active: editorState.isHeading2, label: "Subtítulo" },
    { level: 3 as const, Icon: Heading3, active: editorState.isHeading3, label: "Encabezado menor" },
  ];

  return (
    <div className="sticky top-16 z-30 mb-8 flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 rounded-2xl bg-search-bg/95 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-opacity-95 sm:top-24 sm:mb-12 sm:flex-nowrap">
      <div className="flex max-w-full items-center gap-1 overflow-x-auto">
        <div className="shrink-0 border-r border-toolbar-bg/30 px-1 sm:px-3">
          <label className="sr-only" htmlFor="chapter-font-family">Fuente del capítulo</label>
          <select
            id="chapter-font-family"
            disabled={!formattingEnabled}
            value={editorState.fontFamily || ""}
            onChange={(event) => {
              if (event.target.value) editor.chain().focus().setFontFamily(event.target.value).run();
              else editor.chain().focus().unsetFontFamily().run();
            }}
            className="max-w-36 cursor-pointer rounded-lg bg-search-bg px-2 py-2 text-xs text-global outline-none transition hover:bg-toolbar-bg/50 disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-48 sm:text-sm"
          >
            <option value="">Fuente predeterminada</option>
            {fontOptions.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}
          </select>
        </div>
        <div className="flex shrink-0 items-center space-x-1 border-r border-toolbar-bg/30 px-2">
          {([
            { Icon: Bold, active: editorState.isBold, disabled: !editorState.canBold, label: "Negrita", run: () => editor.chain().focus().toggleBold().run() },
            { Icon: Italic, active: editorState.isItalic, disabled: !editorState.canItalic, label: "Cursiva", run: () => editor.chain().focus().toggleItalic().run() },
            { Icon: Underline, active: editorState.isUnderline, disabled: !editorState.canUnderline, label: "Subrayado", run: () => editor.chain().focus().toggleUnderline().run() },
          ]).map(({ Icon, active, disabled, label, run }) => (
            <button key={label} type="button" aria-label={label} aria-pressed={active} onClick={run} disabled={disabled || !formattingEnabled}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${active ? "bg-high-enfasis text-background-global" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global"}`}>
              <Icon size={20} />
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 border-r border-toolbar-bg/30 px-2">
          {headingOptions.map(({ level, Icon, active, label }) => (
            <button key={level} type="button" aria-label={label} aria-pressed={active} disabled={!formattingEnabled}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${active ? "bg-high-enfasis text-background-global" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global"}`}>
              <Icon size={20} />
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center px-2">
          {([
            { align: "left" as const, Icon: TextAlignStart, active: editorState.isLeft, disabled: !editorState.canLeft, label: "Alinear a la izquierda" },
            { align: "center" as const, Icon: TextAlignCenter, active: editorState.isCentered, disabled: !editorState.canCenter, label: "Centrar" },
            { align: "right" as const, Icon: TextAlignEnd, active: editorState.isRight, disabled: !editorState.canRight, label: "Alinear a la derecha" },
            { align: "justify" as const, Icon: TextAlignJustify, active: editorState.isJustified, disabled: !editorState.canJustify, label: "Justificar" },
          ]).map(({ align, Icon, active, disabled, label }) => (
            <button key={align} type="button" aria-label={label} aria-pressed={active} disabled={disabled || !formattingEnabled}
              onClick={() => editor.chain().focus().setTextAlign(align).run()}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${active ? "bg-high-enfasis text-background-global" : "text-several-light hover:bg-toolbar-bg/50 hover:text-global"}`}>
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={onSave} className="shrink-0 cursor-pointer rounded-xl bg-high-enfasis px-4 py-2 text-sm font-bold tracking-tight text-background-global transition-all hover:scale-95 sm:px-6">
        Guardar
      </button>
    </div>
  );
};

export default Toolbar;
