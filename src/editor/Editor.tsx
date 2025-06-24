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
        },
        nodes: [HeadingNode, TableNode, TableRowNode, TableCellNode, ImageNode, ListNode, ListItemNode],
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
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                <ToolbarPlugin dataService={dataService} onOpenImageModal={handleOpenImageModal} setEditorRef={setEditorRef} />
                <div className="editor-scrollable">
                    <TablePlugin />
                    <ListPlugin />
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input" />}
                        placeholder={<div className="editor-placeholder">Enter text...</div>}
                        ErrorBoundary={({ children }) => <>{children}</>}
                    />
                    <OnChangePlugin onChange={handleChange} />
                    <HistoryPlugin />
                    <SelectImageModal dataService={dataService} isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} onSelect={handleSelectImage} />
                </div>
            </div>
        </LexicalComposer>
    );
};

export default Editor;
