// `src/components/Editor.tsx`
import React, { useState, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import ToolbarPlugin from './ToolbarPlugin';
import { EditorState } from 'lexical';
import './Editor.css';
import { $createImageNode } from './ImageNode';
import { $getSelection, $isRangeSelection } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import TablePlugin from './TablePlugin';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ImageNode } from './ImageNode';
import { ICMSCrudService } from "../helpers/ICMSCrudService";
import SelectImageModal from './SelectImageModal';
import { $generateHtmlFromNodes } from '@lexical/html';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import {Box, Paper, Typography, Link, Avatar} from '@mui/material';
import { CodeNode, CodeHighlightNode} from '@lexical/code';
import 'prismjs/themes/prism.css';
import CodeHighlightPlugin from "./CodeHighlightPlugin";
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import {editor_config} from "../editor_config";
import {endpoints} from "../editor_endpoints";
import {Utils} from "../helpers/Utils";


const Editor: React.FC<{ dataService: ICMSCrudService }> = ({ dataService }) => {
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [editorRef, setEditorRef] = useState<any>(null);

    // Remove old postMeta state and use loadedPost state
    const [loadedPost, setLoadedPost] = useState<{ 
        meta?: { title?: string; author?: string; dateSaved?: string }, 
        content?: any,
        published?: boolean,
        released?: boolean,
        preview?: {
            catalogEntryUri: string;
        },
        media?: { key: string; }[],
        thumbnail?: {
            name: string;
            description: string;
            type: string;
            key: string;
        }
    }>({});

    // Track polling status
    const [isPolling, setIsPolling] = useState(false);

    const initialConfig = {
        namespace: 'MyEditor',
        onError: (error: Error) => {
            console.error('Lexical Error:', error);
        },
        theme: {
            table: 'custom-table',
            code: 'editor__code',
            codeHighlight: {
                atrule: 'editor__tokenAttr',
                attr: 'editor__tokenAttr',
                boolean: 'editor__tokenProperty',
                builtin: 'editor__tokenSelector',
                cdata: 'editor__tokenComment',
                char: 'editor__tokenSelector',
                class: 'editor__tokenFunction',
                'class-name': 'editor__tokenFunction',
                comment: 'editor__tokenComment',
                constant: 'editor__tokenProperty',
                deleted: 'editor__tokenDeleted',
                doctype: 'editor__tokenComment',
                entity: 'editor__tokenOperator',
                function: 'editor__tokenFunction',
                important: 'editor__tokenVariable',
                inserted: 'editor__tokenInserted',
                keyword: 'editor__tokenAttr',
                namespace: 'editor__tokenVariable',
                number: 'editor__tokenProperty',
                operator: 'editor__tokenOperator',
                prolog: 'editor__tokenComment',
                property: 'editor__tokenProperty',
                punctuation: 'editor__tokenPunctuation',
                regex: 'editor__tokenVariable',
                selector: 'editor__tokenSelector',
                string: 'editor__tokenSelector',
                symbol: 'editor__tokenProperty',
                tag: 'editor__tokenProperty',
                unchanged: 'editor__tokenUnchanged',
                url: 'editor__tokenOperator',
                variable: 'editor__tokenVariable',
            },

        },
        nodes: [HeadingNode, TableNode, TableRowNode, TableCellNode, ImageNode, ListNode, ListItemNode, CodeHighlightNode, CodeNode, LinkNode],
    };

    /**
     * Sanitizes HTML content to prevent XSS attacks
     * @param html The HTML content to sanitize
     * @returns Sanitized HTML string
     */
    const sanitizeHTML = (html: string): string => {
        // Basic sanitization of script tags and event handlers
        // Note: In a production environment, a library like DOMPurify should be used
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/on\w+='[^']*'/g, '')
            .replace(/on\w+=\w+/g, '');
    };

    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            // Handle editor state changes here
            // Generate HTML content and sanitize it
            const htmlString = $generateHtmlFromNodes(editorRef, null);
            // Sanitize the HTML but we don't need to store it since we're not using it
            sanitizeHTML(htmlString);
            // HTML content is now sanitized but not logged to console
        });
    };

    // Handler to open the image modal from ToolbarPlugin
    // const handleOpenImageModal = useCallback(() => {
    //     setImageModalOpen(true);
    // }, []);

    // Handler to insert image into the editor
    const handleSelectImage = useCallback((url: string, key: string, width?: number, height?: number) => {
        setImageModalOpen(false);
        if (editorRef) {
            editorRef.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    selection.insertNodes([$createImageNode({ src: url, alt: key, width, height })]);
                }
            });
        }
    }, [editorRef]);

    return (
        <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto', my: 2 }}>
            <Paper elevation={2} sx={{ p: 2, position: 'relative', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                {/* Post Meta-Data Display */}
                {(loadedPost.meta?.title || loadedPost.meta?.author ) && (
                    <Box style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8, display: 'flex', alignItems: 'flex-start' }}>
                        {/* Display thumbnail if available, otherwise use first media item */}
                        {((loadedPost.thumbnail && loadedPost.thumbnail.key) || (loadedPost.media && loadedPost.media.length > 0)) && (
                        <Avatar
                            src={Utils.cleanURL(editor_config.MediaProxy, loadedPost.thumbnail?.key || (loadedPost.media && loadedPost.media[0]?.key) || '')}
                            alt={loadedPost.thumbnail?.name || (loadedPost.media && loadedPost.media[0]?.key) || ''}
                            sx={{ width: 64, height: 64, mr: 2 }}
                            variant="rounded"
                        />
                        )}
                        <Box sx={{ flex: 1 }}>
                            {loadedPost.meta?.title && <div style={{ fontSize: 22, fontWeight: 600 }}>{loadedPost.meta.title}</div>}
                            {loadedPost.meta?.author && <div style={{ fontSize: 15, color: '#555' }}>By {loadedPost.meta.author}</div>}
                            {loadedPost.meta?.dateSaved && <div style={{ fontSize: 12, color: '#888' }}>{loadedPost.meta.dateSaved}</div>}
                            {/* Publication and Release Status */}
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 1 }}>
                                <Typography variant="caption" color={loadedPost.published ? "success.main" : "text.secondary"}>
                                    {loadedPost.published ? "Published ✓" : "Not Published"}
                                </Typography>
                                <Typography variant="caption" color={loadedPost.released ? "success.main" : "text.secondary"}>
                                    {loadedPost.released ? "Released ✓" : "Not Released"}
                                </Typography>
                                {loadedPost.preview?.catalogEntryUri && (
                                    <Link
                                        href={Utils.cleanURL(endpoints.Preview.URL, loadedPost.preview.catalogEntryUri)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="caption"
                                    >
                                        Preview Link
                                    </Link>
                                )}
                                {isPolling && (
                                    <Typography variant="caption" color="info.main">
                                        Polling for meta-data...
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    <LexicalComposer initialConfig={initialConfig}>
                        {/* Toolbar always visible (sticky) */}
                        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
                            <ToolbarPlugin
                                dataService={dataService}
                                setEditorRef={setEditorRef}
                                onOpenImageModal={() => setImageModalOpen(true)}
                                onPostLoaded={setLoadedPost}
                                setIsPolling={setIsPolling}
                            />
                        </div>
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="editor-input" />}
                            placeholder={<div style={{ opacity: 0.5 }}>Start typing...</div>}
                            ErrorBoundary={({ children }) => <div className="editor-error">{children}</div>}
                        />
                        <HistoryPlugin />
                        <OnChangePlugin onChange={handleChange} />
                        <ListPlugin />
                        <TablePlugin />
                        <CodeHighlightPlugin/>
                        <LinkPlugin />
                        <SelectImageModal isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} onSelect={handleSelectImage} dataService={dataService} />
                    </LexicalComposer>
                </div>
            </Paper>
        </Box>
    );
};

export default Editor;
