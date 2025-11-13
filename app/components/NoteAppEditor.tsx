"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import OrderedList from "@tiptap/extension-ordered-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
} from "lucide-react";
import { NoteAppEditorProps } from "../types/types";

export default function NoteAppEditor({
  content,
  onUpdate,
}: NoteAppEditorProps) {
  const [isAlignmentOpen, setIsAlignmentOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isHeadingOpen, setIsHeadingOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-outside ml-4",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "list-item",
          },
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal list-outside ml-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Get current alignment for display
  const getCurrentAlignment = () => {
    if (editor.isActive({ textAlign: "left" })) return "left";
    if (editor.isActive({ textAlign: "center" })) return "center";
    if (editor.isActive({ textAlign: "right" })) return "right";
    if (editor.isActive({ textAlign: "justify" })) return "justify";
    return "left"; // default
  };

  const currentAlignment = getCurrentAlignment();

  const alignmentOptions = [
    { value: "left", label: "Align Left", icon: AlignLeft },
    { value: "center", label: "Align Center", icon: AlignCenter },
    { value: "right", label: "Align Right", icon: AlignRight },
    { value: "justify", label: "Justify", icon: AlignJustify },
  ];

  const listOptions = [
    {
      value: "bullet",
      label: "Bullet List",
      icon: List,
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      value: "ordered",
      label: "Numbered List",
      icon: ListOrdered,
      command: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  const headingOptions = [
    {
      value: "paragraph",
      label: "Paragraph",
      icon: Pilcrow,
      command: () => editor.chain().focus().setParagraph().run(),
    },
    {
      value: "h1",
      label: "Heading 1",
      icon: Heading1,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      value: "h2",
      label: "Heading 2",
      icon: Heading2,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      value: "h3",
      label: "Heading 3",
      icon: Heading3,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ];

  const handleAlignmentChange = (alignment: string) => {
    editor.chain().focus().setTextAlign(alignment).run();
    setIsAlignmentOpen(false);
  };

  const handleListChange = (command: () => void) => {
    command();
    setIsListOpen(false);
  };

  const handleHeadingChange = (command: () => void) => {
    command();
    setIsHeadingOpen(false);
  };

  const handleHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  // Get current heading for display
  const getCurrentHeadingIcon = () => {
    if (editor.isActive("heading", { level: 1 })) return <Heading1 size={18} />;
    if (editor.isActive("heading", { level: 2 })) return <Heading2 size={18} />;
    if (editor.isActive("heading", { level: 3 })) return <Heading3 size={18} />;
    return <Pilcrow size={18} />;
  };

  // Check if any heading is active
  const isAnyHeadingActive = editor.isActive("heading");

  return (
    <div className="border border-gray-600 rounded focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Menu Bar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-[#EADDCA]">
        {/* Text Formatting Group */}
        <div className="flex ">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${
              editor.isActive("bold")
                ? "bg-blue-100 text-blue-500"
                : "hover:bg-gray-200"
            }`}
            title="Bold"
          >
            <Bold size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${
              editor.isActive("italic")
                ? "bg-blue-100 text-blue-500"
                : "hover:bg-gray-200"
            }`}
            title="Italic"
          >
            <Italic size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded ${
              editor.isActive("underline")
                ? "bg-blue-100 text-blue-500"
                : "hover:bg-gray-200"
            }`}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </button>
        </div>

        {/* Highlighter */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded ${
            editor.isActive("highlight")
              ? "bg-yellow-100 text-yellow-600"
              : "hover:bg-gray-200"
          }`}
          title="Highlight"
        >
          <Highlighter size={18} />
        </button>

        {/* Lists Dropdown */}
        <div className="relative ">
          <button
            type="button"
            onClick={() => setIsListOpen(!isListOpen)}
            className="flex items-center gap-1 p-2 rounded hover:bg-gray-200"
            title="Lists"
          >
            <List size={18} />
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {isListOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[160px]">
              {listOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleListChange(option.command)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <IconComponent size={16} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Headings Dropdown */}
        <div className="relative ">
          <button
            type="button"
            onClick={() => setIsHeadingOpen(!isHeadingOpen)}
            className={`flex items-center gap-1 p-2 rounded hover:bg-gray-200 ${
              isAnyHeadingActive ? "bg-blue-100 text-blue-500" : ""
            }`}
            title="Text Format"
          >
            {getCurrentHeadingIcon()}
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {isHeadingOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[140px]">
              {headingOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive =
                  option.value === "paragraph"
                    ? editor.isActive("paragraph")
                    : editor.isActive("heading", {
                        level: parseInt(option.value.replace("h", "")),
                      });

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleHeadingChange(option.command)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 ${
                      isActive ? "bg-blue-50 text-blue-600" : ""
                    } ${option.value === "paragraph" ? "rounded-t-lg" : ""} ${
                      option.value === "h3" ? "rounded-b-lg" : ""
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Alignment Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAlignmentOpen(!isAlignmentOpen)}
            className="flex items-center gap-1 p-2 rounded hover:bg-gray-200"
            title="Text Alignment"
          >
            {currentAlignment === "left" && <AlignLeft size={18} />}
            {currentAlignment === "center" && <AlignCenter size={18} />}
            {currentAlignment === "right" && <AlignRight size={18} />}
            {currentAlignment === "justify" && <AlignJustify size={18} />}
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {isAlignmentOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[140px]">
              {alignmentOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAlignmentChange(option.value)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 ${
                      currentAlignment === option.value
                        ? "bg-blue-50 text-blue-600"
                        : ""
                    } ${option.value === "left" ? "rounded-t-lg" : ""} ${
                      option.value === "justify" ? "rounded-b-lg" : ""
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={handleHorizontalRule}
          className="p-2 rounded hover:bg-gray-200"
          title="Horizontal Line"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-3">
        <EditorContent
          editor={editor}
          className="min-h-[120px] prose max-w-none"
        />
      </div>

      {/* Close dropdowns when clicking outside */}
      {(isAlignmentOpen || isListOpen || isHeadingOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setIsAlignmentOpen(false);
            setIsListOpen(false);
            setIsHeadingOpen(false);
          }}
        />
      )}
    </div>
  );
}
