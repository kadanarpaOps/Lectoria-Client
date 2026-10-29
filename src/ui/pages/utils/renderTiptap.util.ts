import TextAlign from "@tiptap/extension-text-align";
import { generateHTML, generateText, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const extensions = [ 
  StarterKit,
  TextAlign.configure({
    alignments: ['left', 'center', 'right', 'justify'],
    types: ['heading', 'paragraph'],
    defaultAlignment: 'left'
  })
];

/**
 * Method 1: Converts Tiptap JSON into raw string content
 * @param {Object} jsonDoc - The Tiptap JSON object
 * @returns {string} Raw String
 */
export const renderWithoutFormat = (jsonDoc: JSONContent) => {
  if (!jsonDoc) return "";
  try {
    return generateText(jsonDoc, extensions);
  } catch (error) {
    console.error("Error rendering TipTap Text: ", error);
    return '';
  }
}

/**
 * Method 2: Converts Tiptap JSON into HTML Formatted content
 * @param {Object} jsonDoc - The Tiptap JSON object
 * @returns {string} Raw String
 */
export const renderWithFormat = (jsonDoc: JSONContent) => {
  if (!jsonDoc) return "";
  try {
    return generateHTML(jsonDoc, extensions);
  } catch (error) {
    console.error("Error rendering TipTap Html: ", error);
    return '';
  }
}

/**
 * Methods 3: Count words in no formatted content
 * @param {Object} jsonDoc - The Tiptap JSON object
 * @returns {string} - The total words in the content
 */
export const countTotalWords = (jsonDoc: JSONContent) => {
  const text = renderWithoutFormat(jsonDoc);
  const cleanText = text.trim();

  if (!cleanText) return 0;

  return cleanText.split(/\s+/).length;
}
