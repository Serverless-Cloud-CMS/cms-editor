// `src/components/Editor.tsx`
import React, { useState, useCallback, useEffect } from 'react';
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
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { Box, Paper } from '@mui/material';
import { CodeNode, CodeHighlightNode} from '@lexical/code';
import 'prismjs/themes/prism.css';
import CodeHighlightPlugin from "./CodeHighlightPlugin";


const Editor: React.FC<{ dataService: ICMSCrudService }> = ({ dataService }) => {
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [editorRef, setEditorRef] = useState<any>(null);

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
        nodes: [HeadingNode, TableNode, TableRowNode, TableCellNode, ImageNode, ListNode, ListItemNode, CodeHighlightNode,CodeNode],
    };

    const handleChange = (editorState: EditorState) => {

        editorState.read(() => {
            // Handle editor state changes here
            console.log('Editor content changed');
            const htmlString = $generateHtmlFromNodes(editorRef, null);
            console.log(htmlString);
        });
    };

    // Handler to open the image modal from ToolbarPlugin
    const handleOpenImageModal = useCallback(() => {
        setImageModalOpen(true);
    }, []);

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
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', my: 2 }}>
            <Paper elevation={2} sx={{ p: 2 }}>
                {/* Editor core UI */}
                <LexicalComposer initialConfig={initialConfig}>
                    <ToolbarPlugin dataService={dataService} setEditorRef={setEditorRef} onOpenImageModal={() => setImageModalOpen(true)} />
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
                    <SelectImageModal isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} onSelect={handleSelectImage} dataService={dataService} />
                </LexicalComposer>
            </Paper>
        </Box>
    );
};

export default Editor;
