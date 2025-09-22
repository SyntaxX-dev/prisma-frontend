'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import './rich-text-editor.css';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Link } from '@tiptap/extension-link';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { createLowlight } from 'lowlight';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Link as LinkIcon,
    Smile
} from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Button } from '../ui/button';
import { useState } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            BulletList,
            OrderedList,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-400 underline cursor-pointer',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight: createLowlight(),
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Digite algo...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        setLinkUrl(previousUrl);
        setIsLinkModalOpen(true);
    };

    const setLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
        } else {
            editor.chain().focus().unsetLink().run();
        }
        setIsLinkModalOpen(false);
        setLinkUrl('');
    };

    const insertEmoji = (emoji: string) => {
        editor.chain().focus().insertContent(emoji).run();
        setIsEmojiPickerOpen(false);
    };

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={`h-8 w-8 p-0 ${isActive
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            title={title}
        >
            {children}
        </Button>
    );

    return (
        <div className="border border-[#323238] rounded-lg bg-[#29292E] relative">
            <div className="flex items-center gap-1 p-3 border-b border-[#323238]">
                <div className="flex items-center gap-1">
                    <select
                        className="bg-[#202024] border border-[#323238] text-white text-sm px-3 py-1 rounded cursor-pointer hover:bg-[#29292E] focus:outline-none focus:ring-2 focus:ring-[#B3E240]/20"
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'paragraph') {
                                editor.chain().focus().setParagraph().run();
                            } else if (value === 'heading1') {
                                editor.chain().focus().toggleHeading({ level: 1 }).run();
                            } else if (value === 'heading2') {
                                editor.chain().focus().toggleHeading({ level: 2 }).run();
                            } else if (value === 'heading3') {
                                editor.chain().focus().toggleHeading({ level: 3 }).run();
                            }
                        }}
                        value={
                            editor.isActive('heading', { level: 1 }) ? 'heading1' :
                                editor.isActive('heading', { level: 2 }) ? 'heading2' :
                                    editor.isActive('heading', { level: 3 }) ? 'heading3' :
                                        'paragraph'
                        }
                    >
                        <option value="paragraph">Texto</option>
                        <option value="heading1">Título 1</option>
                        <option value="heading2">Título 2</option>
                        <option value="heading3">Título 3</option>
                    </select>
                </div>

                <div className="w-px h-4 bg-[#323238] mx-2" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Negrito"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Itálico"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Riscado"
                >
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-4 bg-[#323238] mx-2" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Bloco de código"
                >
                    <Code className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Lista com marcadores"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Lista numerada"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={addLink}
                    isActive={editor.isActive('link')}
                    title="Adicionar link"
                >
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>

                <div className="relative">
                    <ToolbarButton
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        isActive={isEmojiPickerOpen}
                        title="Emoji"
                    >
                        <Smile className="w-4 h-4" />
                    </ToolbarButton>

                    {isEmojiPickerOpen && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2">
                            <div className="bg-[#202024] border border-[#323238] rounded-lg shadow-lg">
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => insertEmoji(emojiData.emoji)}
                                    theme={Theme.DARK}
                                    width={300}
                                    height={350}
                                    skinTonesDisabled
                                    searchDisabled={false}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="min-h-[200px]">
                <EditorContent
                    editor={editor}
                    className="prose prose-invert max-w-none focus:outline-none"
                />
            </div>

            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#202024] border border-[#323238] rounded-lg p-6 w-96">
                        <h3 className="text-white text-lg font-semibold mb-4">Adicionar Link</h3>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://exemplo.com"
                            className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer px-3 py-2 rounded"
                        />
                        <div className="flex justify-end space-x-3 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={setLink}
                                className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer transition-colors"
                            >
                                Adicionar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
