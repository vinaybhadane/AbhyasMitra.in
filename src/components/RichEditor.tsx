'use client';

import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TipTapImage from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import imageCompression from 'browser-image-compression';
import { uploadImage } from '@/lib/firestore';
import toast from 'react-hot-toast';
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, Loader2,
  Table as TableIcon, Columns, Rows, Trash2, Plus,
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichEditor({ content, onChange }: EditorProps) {
  // ALL hooks must be declared before any early returns
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TipTapImage.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your notes...' }),
      // Table with full clipboard paste support (Excel, Google Sheets, HTML tables)
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

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected if needed
    e.target.value = '';

    setUploading(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' as const };
      const compressed = await imageCompression(file, options);

      // Force explicit webp MIME type — browser-image-compression may return
      // a blob with the original type on some browsers
      const webpBlob = compressed.type === 'image/webp'
        ? compressed
        : new Blob([compressed], { type: 'image/webp' });
      const webpFile = new File([webpBlob], compressed.name || 'image.webp', { type: 'image/webp' });

      const cleanName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[.-]|[.-]$/g, '');
      const nameWithoutExt = cleanName.replace(/\.[^.]+$/, '');
      const fileName = `${nameWithoutExt}-${Date.now()}.webp`;

      const url = await uploadImage(webpFile, `posts/content/${fileName}`);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Image uploaded!', { id: toastId });
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Check your connection and permissions.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => fileInputRef.current?.click();

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const isInTable = editor.isActive('table');

  const toolbarButtons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: () => editor.isActive('bold'), title: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: () => editor.isActive('italic'), title: 'Italic' },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: () => editor.isActive('strike'), title: 'Strikethrough' },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: () => editor.isActive('code'), title: 'Inline Code' },
    null, // separator
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
    null,
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: () => editor.isActive('bulletList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: () => editor.isActive('orderedList'), title: 'Ordered List' },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: () => editor.isActive('blockquote'), title: 'Blockquote' },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: () => false, title: 'Horizontal Rule' },
    null,
    { icon: LinkIcon, action: addLink, active: () => editor.isActive('link'), title: 'Add Link' },
    { icon: ImageIcon, action: addImage, active: () => uploading, title: uploading ? 'Uploading...' : 'Add Image' },
    null,
    { icon: TableIcon, action: insertTable, active: () => editor.isActive('table'), title: 'Insert Table (3×3)' },
    null,
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: () => false, title: 'Undo' },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: () => false, title: 'Redo' },
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" disabled={uploading} />

      {/* Upload progress overlay */}
      {uploading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800 text-sm text-indigo-600 dark:text-indigo-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Compressing &amp; uploading image...</span>
        </div>
      )}

      {/* Main Toolbar */}
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

      {/* Contextual Table Toolbar — shown only when cursor is inside a table */}
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

      {/* Editor Content */}
      <EditorContent editor={editor} />
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
