'use client';

import { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension, InputRule } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TipTapImage from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, Check, X,
  Table as TableIcon, Columns, Rows, Trash2, Plus,
} from 'lucide-react';
import katex from 'katex';
import dynamic from 'next/dynamic';

const MathInputPanel = dynamic(() => import('@/components/MathInputPanel'), { ssr: false });

// ─── Shared Math Utilities ────────────────────────────────────────────────────

/** Escapes a string for use as an HTML attribute value */
function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escapes a string for use as plain HTML text content */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Renders a LaTeX string to a KaTeX HTML node (inline or block) */
function latexToHtml(latex: string, block: boolean): string {
  try {
    const rendered = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: block,
      output: 'html',
      trust: false,
    });
    const tag = block ? 'div' : 'span';
    const cls = block ? 'math-block' : 'math-inline';
    return `<${tag} class="${cls}" data-latex="${escapeAttr(latex)}">${rendered}</${tag}>`;
  } catch {
    return block ? `<p>$$${escapeHtml(latex)}$$</p>` : escapeHtml(`$${latex}$`);
  }
}

/**
 * Converts a plain-text string (which may contain $$...$$ and $...$ patterns)
 * into an HTML string suitable for insertion into TipTap.
 *
 * Handles:
 *  - Multi-line block math:  $$\n...\n$$
 *  - Inline block math:      $$formula$$
 *  - Inline math:            $formula$
 *  - Plain text paragraphs
 */
function convertMathTextToHtml(text: string): string {
  const segments: string[] = [];

  // Step 1: split on block math first ($$...$$), including multiline
  const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  for (const part of blockParts) {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      // Block math segment
      const latex = part.slice(2, -2).trim();
      if (latex) segments.push(latexToHtml(latex, true));
    } else {
      // Plain text with possible inline math — split into lines
      const lines = part.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Process inline $...$ in this line
        const converted = trimmed.replace(
          /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,
          (_, latex) => latexToHtml(latex.trim(), false)
        );
        segments.push(`<p>${converted}</p>`);
      }
    }
  }

  return segments.join('') || `<p>${escapeHtml(text)}</p>`;
}

// ─── TipTap Math Input Rules Extension ───────────────────────────────────────

/**
 * Auto-converts typed LaTeX delimiters to rendered KaTeX:
 *   - Type $$formula$$ → block math
 *   - Type $formula$   → inline math
 */
const MathInputRules = Extension.create({
  name: 'mathInputRules',

  addInputRules() {
    return [
      // ── Block math: $$formula$$ ─────────────────────────────────
      new InputRule({
        // Matches $$...$$  (no nested $ inside)
        find: /\$\$([^$]+?)\$\$$/,
        handler: ({ range, match, chain }) => {
          const latex = match[1].trim();
          if (!latex) return null;
          const html = latexToHtml(latex, true);
          chain().deleteRange(range).insertContent(html).run();
        },
      }),

      // ── Inline math: $formula$ ──────────────────────────────────
      new InputRule({
        // Matches $...$ — avoid matching $$ by using negative lookahead/lookbehind
        find: /(?<!\$)\$([^$\n]+?)\$(?!\$)$/,
        handler: ({ range, match, chain }) => {
          const latex = match[1].trim();
          if (!latex) return null;
          const html = latexToHtml(latex, false);
          chain().deleteRange(range).insertContent(html + ' ').run();
        },
      }),
    ];
  },
});

// ─── Component ───────────────────────────────────────────────────────────────

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichEditor({ content, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrlInputRef = useRef<HTMLInputElement>(null);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showMathPanel, setShowMathPanel] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      MathInputRules,         // ← auto-render typed $...$ and $$...$$
      TipTapImage.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Write notes... Type $E=mc^2$ for inline or $$\\frac{a}{b}$$ for block math.',
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: 'editor-table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[500px] px-6 py-5 focus:outline-none',
      },
    },
  });

  // ── Paste Handler: convert pasted LaTeX text to rendered KaTeX ──────────────
  useEffect(() => {
    if (!editor) return;

    const MATH_PATTERN = /\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/;

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain') || '';
      if (!text.includes('$')) return;            // no math possible
      if (!MATH_PATTERN.test(text)) return;       // no valid math pattern

      // We handle this paste — prevent the browser's default paste
      e.preventDefault();
      e.stopPropagation();

      const html = convertMathTextToHtml(text);
      editor.chain().focus().insertContent(html).run();
    };

    // Use capture phase so we intercept before TipTap's own paste handler
    const dom = editor.view.dom;
    dom.addEventListener('paste', handlePaste as EventListener, true);
    return () => dom.removeEventListener('paste', handlePaste as EventListener, true);
  }, [editor]);

  if (!editor) return null;

  /* ─── Insert image from URL ─────────────────────────────────── */
  const openImagePanel = () => {
    setImageUrl('');
    setShowImagePanel(true);
    setShowMathPanel(false);
    setTimeout(() => imageUrlInputRef.current?.focus(), 50);
  };

  const insertImageFromUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/.test(url)) {
      alert('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    editor.chain().focus().setImage({ src: url }).run();
    setShowImagePanel(false);
    setImageUrl('');
  };

  const cancelImagePanel = () => {
    setShowImagePanel(false);
    setImageUrl('');
  };

  /* ─── Add link ──────────────────────────────────────────────── */
  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  /* ─── Insert table ──────────────────────────────────────────── */
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  /* ─── Insert math formula (from MathInputPanel) ─────────────── */
  const insertMath = (latex: string, block: boolean) => {
    const html = latexToHtml(latex, block);
    editor.chain().focus().insertContent(html).run();
  };

  const isInTable = editor.isActive('table');

  // Sigma toolbar icon
  const SigmaIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 4H6l6 8-6 8h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const toolbarButtons = [
    { icon: Bold,          action: () => editor.chain().focus().toggleBold().run(),              active: () => editor.isActive('bold'),                    title: 'Bold' },
    { icon: Italic,        action: () => editor.chain().focus().toggleItalic().run(),            active: () => editor.isActive('italic'),                  title: 'Italic' },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(),            active: () => editor.isActive('strike'),                  title: 'Strikethrough' },
    { icon: Code,          action: () => editor.chain().focus().toggleCode().run(),              active: () => editor.isActive('code'),                    title: 'Inline Code' },
    null,
    { icon: Heading2,      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
    { icon: Heading3,      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
    null,
    { icon: List,          action: () => editor.chain().focus().toggleBulletList().run(),        active: () => editor.isActive('bulletList'),              title: 'Bullet List' },
    { icon: ListOrdered,   action: () => editor.chain().focus().toggleOrderedList().run(),       active: () => editor.isActive('orderedList'),             title: 'Ordered List' },
    { icon: Quote,         action: () => editor.chain().focus().toggleBlockquote().run(),        active: () => editor.isActive('blockquote'),              title: 'Blockquote' },
    { icon: Minus,         action: () => editor.chain().focus().setHorizontalRule().run(),       active: () => false,                                     title: 'Horizontal Rule' },
    null,
    { icon: LinkIcon,      action: addLink,                                                      active: () => editor.isActive('link'),                   title: 'Add Link' },
    { icon: ImageIcon,     action: openImagePanel,                                               active: () => showImagePanel,                            title: 'Insert Image from URL' },
    null,
    { icon: TableIcon,     action: insertTable,                                                  active: () => editor.isActive('table'),                  title: 'Insert Table (3×3)' },
    null,
    {
      icon: SigmaIcon,
      action: () => { setShowMathPanel((v) => !v); setShowImagePanel(false); },
      active: () => showMathPanel,
      title: 'Insert Math Formula (LaTeX)',
    },
    null,
    { icon: Undo,          action: () => editor.chain().focus().undo().run(),                    active: () => false,                                     title: 'Undo' },
    { icon: Redo,          action: () => editor.chain().focus().redo().run(),                    active: () => false,                                     title: 'Redo' },
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" />

      {/* ── Main Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        {toolbarButtons.map((btn, i) =>
          btn === null ? (
            <div key={i} className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />
          ) : (
            <button
              key={btn.title}
              type="button"
              onClick={btn.action}
              title={btn.title}
              className={`p-1.5 rounded-lg transition-colors ${
                btn.active()
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <btn.icon className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* ── Image URL Panel ──────────────────────────────────────── */}
      {showImagePanel && (
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50">
          <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
          <input
            ref={imageUrlInputRef}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') insertImageFromUrl();
              if (e.key === 'Escape') cancelImagePanel();
            }}
            placeholder="Paste image URL here (https://example.com/image.jpg)"
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={insertImageFromUrl}
            disabled={!imageUrl.trim()}
            title="Insert image"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Insert
          </button>
          <button
            type="button"
            onClick={cancelImagePanel}
            title="Cancel"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Math Input Panel ─────────────────────────────────────── */}
      {showMathPanel && (
        <MathInputPanel
          onInsert={insertMath}
          onClose={() => setShowMathPanel(false)}
        />
      )}

      {/* ── Contextual Table Toolbar ─────────────────────────────── */}
      {isInTable && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 border-b border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-xs">
          <span className="text-indigo-500 dark:text-indigo-400 font-semibold mr-1 text-[11px] uppercase tracking-wide">Table:</span>
          <TableCtxBtn title="Add Column Before" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <Plus className="w-3 h-3" /><Columns className="w-3 h-3" />←
          </TableCtxBtn>
          <TableCtxBtn title="Add Column After" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            →<Columns className="w-3 h-3" /><Plus className="w-3 h-3" />
          </TableCtxBtn>
          <TableCtxBtn title="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()} danger>
            <Trash2 className="w-3 h-3" /><Columns className="w-3 h-3" />
          </TableCtxBtn>
          <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-700 mx-0.5" />
          <TableCtxBtn title="Add Row Before" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <Plus className="w-3 h-3" /><Rows className="w-3 h-3" />↑
          </TableCtxBtn>
          <TableCtxBtn title="Add Row After" onClick={() => editor.chain().focus().addRowAfter().run()}>
            ↓<Rows className="w-3 h-3" /><Plus className="w-3 h-3" />
          </TableCtxBtn>
          <TableCtxBtn title="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()} danger>
            <Trash2 className="w-3 h-3" /><Rows className="w-3 h-3" />
          </TableCtxBtn>
          <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-700 mx-0.5" />
          <TableCtxBtn title="Toggle Header Row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
            Header Row
          </TableCtxBtn>
          <TableCtxBtn title="Toggle Header Column" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
            Header Col
          </TableCtxBtn>
          <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-700 mx-0.5" />
          <TableCtxBtn title="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} danger>
            <Trash2 className="w-3 h-3" /> Delete Table
          </TableCtxBtn>
        </div>
      )}

      {/* ── Editor Content ───────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Math Syntax Quick Reference ──────────────────────────── */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>💡 <strong>Math auto-renders:</strong></span>
          <span>Type or paste <code className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">$E=mc^2$</code> → inline</span>
          <span><code className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">$$\frac{"{a}{b}"}$$</code> → block</span>
          <span>Click <strong>∑</strong> for formula library</span>
        </p>
      </div>
    </div>
  );
}

/** Small helper button for the contextual table toolbar */
function TableCtxBtn({
  children, onClick, title, danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
        danger
          ? 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
          : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
      }`}
    >
      {children}
    </button>
  );
}
