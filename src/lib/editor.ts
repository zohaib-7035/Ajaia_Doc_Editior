import StarterKit from "@tiptap/starter-kit";

// Single source of truth for the editor schema (used by the editor and by file import).
// StarterKit v3 already includes bold, italic, underline, headings, lists, undo/redo.
export const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false } }),
];
