'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';


import {
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  FileText, Star, Printer
} from 'lucide-react';

import ShareDropdown from './ShareDropdown';

export default function GoogleDocsEditor({
  docId,
  initialTitle,
  initialContent
}: {
  docId: string;
  initialTitle: string;
  initialContent: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [zoom, setZoom] = useState('100');
  const [tabs, setTabs] = useState([
    { id: 1, name: 'Tab 1', content: initialContent, title: initialTitle }
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC' | 'SHARED'>('PRIVATE');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Load visibility from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/documents/${docId}`);
        const data = await res.json();
        setVisibility(data.visibility || 'PRIVATE');
      } catch (err) {
        console.error('Failed to fetch visibility:', err);
      }
    })();
  }, [docId]);

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    FontFamily,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link,
    Image,



  ],
  content: initialContent,
  onUpdate: ({ editor }) => handleContentChange(editor.getHTML()),
  editorProps: {
    attributes: {
      class: 'prose prose-lg max-w-none focus:outline-none min-h-[calc(100vh-200px)] p-12 bg-white',
    },
  },
  autofocus: 'end',
  
});


  const handleContentChange = useCallback(async (newContent: string) => {
    setContent(newContent);
    setTabs(prev =>
      prev.map(tab =>
        tab.id === activeTab ? { ...tab, content: newContent } : tab
      )
    );

    setIsSaving(true);
    try {
      await fetch(`/api/documents/${docId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  }, [docId, activeTab]);

  const handleTitleChange = useCallback(async (newTitle: string) => {
    setTitle(newTitle);
    setTabs(prev =>
      prev.map(tab =>
        tab.id === activeTab ? { ...tab, title: newTitle } : tab
      )
    );

    try {
      await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content }),
      });
    } catch (error) {
      console.error('Failed to save title:', error);
    }
  }, [docId, content, activeTab]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    handleTitleChange(title);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      handleTitleChange(title);
    }
  };

  useEffect(() => {
    const current = tabs.find(tab => tab.id === activeTab);
    if (editor && current && editor.getHTML() !== current.content) {
      editor.commands.setContent(current.content);
      setTitle(current.title);
    }
  }, [activeTab, editor]);

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-3">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 border rounded-t-lg shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-600 w-6 h-6" />
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-lg font-semibold outline-none px-2 py-1 bg-gray-50 rounded"
            />
          ) : (
            <h1
              onClick={handleTitleClick}
              className="text-lg font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            >
              {title || 'Untitled Document'}
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Star className="w-4 h-4" />
          <span>•</span>
          {isSaving ? (
            <span className="text-blue-500">Saving...</span>
          ) : lastSaved ? (
            <span>Last edit: {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>All changes saved</span>
          )}
        </div>

        <ShareDropdown
          docId={docId}
          currentVisibility={visibility}
          onVisibilityChange={setVisibility}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white border px-4 py-2 shadow-sm">
        <div className="flex items-center flex-wrap space-x-2">
          <button onClick={() => editor.chain().focus().undo().run()} className="p-2 hover:bg-gray-100 rounded">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().redo().run()} className="p-2 hover:bg-gray-100 rounded">
            <Redo className="w-4 h-4" />
          </button>
          <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded">
            <Printer className="w-4 h-4" />
          </button>

          <select onChange={(e) => setZoom(e.target.value)} className="p-1 rounded bg-gray-100 text-sm">
            <option value="100">100%</option>
            <option value="125">125%</option>
            <option value="150">150%</option>
            <option value="200">200%</option>
          </select>

          <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} className="p-1 rounded bg-gray-100 text-sm">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Helvetica">Helvetica</option>
          </select>

          <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-2 hover:bg-gray-100 rounded">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="p-2 hover:bg-gray-100 rounded">
            <Italic className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="p-2 hover:bg-gray-100 rounded">
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-2 hover:bg-gray-100 rounded">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-2 hover:bg-gray-100 rounded">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="p-2 hover:bg-gray-100 rounded">
            <AlignRight className="w-4 h-4" />
          </button>

          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 hover:bg-gray-100 rounded">
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-2 hover:bg-gray-100 rounded">
            <ListOrdered className="w-4 h-4" />
          </button>

          <button onClick={() => {
            const url = prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }} className="p-2 hover:bg-gray-100 rounded">
            <ImageIcon className="w-4 h-4" />
          </button>

          <button onClick={() => {
            const url = prompt('Enter link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }} className="p-2 hover:bg-gray-100 rounded">
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex border border-t-0 rounded-b-lg bg-white overflow-hidden h-[calc(100vh-180px)]">
        <aside className="w-64 border-r p-4 bg-gray-50 flex flex-col gap-3">
          <button
            onClick={() => {
              const newId = tabs.length + 1;
              const newTab = { id: newId, name: `Tab ${newId}`, content: '', title: `Untitled ${newId}` };
              setTabs([...tabs, newTab]);
              setActiveTab(newId);
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm"
          >
            + New Tab
          </button>

          <div className="space-y-2">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded cursor-pointer ${activeTab === tab.id ? 'bg-gray-300' : 'hover:bg-gray-100'}`}
              >
                {tab.name}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div
            className="max-w-4xl mx-auto bg-white p-6 rounded shadow min-h-full"
            style={{
              transform: `scale(${parseInt(zoom) / 100})`,
              transformOrigin: 'top left'
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </main>
      </div>
    </div>
  );
}
