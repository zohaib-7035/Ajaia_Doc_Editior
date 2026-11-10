"use client";
import { Editor, useEditorState } from "@tiptap/react";
import { IconBold, IconBullets, IconItalic, IconNumbers, IconRedo, IconUnderline, IconUndo } from "./icons";

export function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-full bg-slate-100 px-2 py-1 sm:px-3">
      <Btn label="Undo" title="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => c().undo().run()}><IconUndo /></Btn>
      <Btn label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!s.canRedo} onClick={() => c().redo().run()}><IconRedo /></Btn>
      <Sep />
      <select
        aria-label="Text style"
        title="Text style"
        className="h-8 cursor-pointer rounded-md bg-transparent px-2 text-sm text-slate-700 hover:bg-slate-200 focus:outline-none"
        value={s.h1 ? "1" : s.h2 ? "2" : s.h3 ? "3" : "0"}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v === 0) c().setParagraph().run();
          else c().setHeading({ level: v as 1 | 2 | 3 }).run();
        }}
      >
        <option value="0">Normal text</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
      <Sep />
      <Btn label="Bold" title="Bold (Ctrl+B)" active={s.bold} onClick={() => c().toggleBold().run()}><IconBold /></Btn>
      <Btn label="Italic" title="Italic (Ctrl+I)" active={s.italic} onClick={() => c().toggleItalic().run()}><IconItalic /></Btn>
      <Btn label="Underline" title="Underline (Ctrl+U)" active={s.underline} onClick={() => c().toggleUnderline().run()}><IconUnderline /></Btn>
      <Sep />
      <Btn label="Bulleted list" title="Bulleted list" active={s.bullet} onClick={() => c().toggleBulletList().run()}><IconBullets /></Btn>
      <Btn label="Numbered list" title="Numbered list" active={s.ordered} onClick={() => c().toggleOrderedList().run()}><IconNumbers /></Btn>
    </div>
  );
}

function Btn(props: { label: string; title: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={props.label}
      aria-pressed={props.active}
      title={props.title}
      disabled={props.disabled}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection
      onClick={props.onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${
        props.active ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:bg-slate-200"
      }`}
    >
      {props.children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-slate-300" />;
