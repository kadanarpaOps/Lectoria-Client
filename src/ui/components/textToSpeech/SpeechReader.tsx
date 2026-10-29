import { useSpeech } from 'react-text-to-speech'
import FloatingMenu from './FloatingMenu';
import { Editor } from "@tiptap/react";

type Props = {
  editor: Editor | null;
}

function SpeechReader ({editor}: Props) {

  const getTextToRead = () => {
    if (!editor) return "";

    const { state } = editor;
    const { from, to } = state.selection;

    const selectedText = state.doc.textBetween(from, to, " ");

    if (selectedText && selectedText.trim().length > 0) {
      return selectedText;
    }

    return editor.getText();
  }

  const { speechStatus, start, pause, stop } = useSpeech({
    text: getTextToRead(),
    highlightText: false
  });

  const handleStart = () => {
    start();
  }

  return (
    <>
      <FloatingMenu 
        start={handleStart} 
        pause={pause} 
        stop={stop} 
        speechStatus={speechStatus}
      />
    </>
  );
}

export default SpeechReader;
