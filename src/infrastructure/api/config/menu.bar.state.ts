import type { Editor } from '@tiptap/core';
import type { EditorStateSnapshot } from '@tiptap/react';

export function menuBarStateSelector(ctx: EditorStateSnapshot<Editor>) {
    const { editor } = ctx;

    return {
        //Text Formatting States
        isBold: editor.isActive('bold'),
        canBold: editor.can().toggleBold(),
        isItalic: editor.isActive('italic'),
        canItalic: editor.can().toggleItalic(),
        isUnderline: editor.isActive('underline'),
        canUnderline: editor.can().toggleUnderline(),
        //Text Align States
        isLeft: editor.isActive({ textAlign: 'left' }),
        canLeft: editor.can().setTextAlign('left'),
        isCentered: editor.isActive({ textAlign: 'center' }),
        canCenter: editor.can().setTextAlign('center'),
        isRight: editor.isActive({ textAlign: 'right' }),
        canRight: editor.can().setTextAlign('right'),
        isJustified: editor.isActive({ textAlign: 'justify' }),
        canJustify: editor.can().setTextAlign('justify'),
    }

}

export type MenuBarState = ReturnType<typeof menuBarStateSelector>
