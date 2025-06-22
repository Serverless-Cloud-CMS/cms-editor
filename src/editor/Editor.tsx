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
        nodes: [HeadingNode, TableNode, TableRowNode, TableCellNode, ImageNode],
    };

    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            // Handle editor state changes here
            console.log('Editor content changed');
        });
    };

    // Handler to open the image modal from ToolbarPlugin
    const handleOpenImageModal = useCallback(() => {
        setImageModalOpen(true);
    }, []);

    // Handler to insert image into the editor
    const handleSelectImage = useCallback((url: string, key: string) => {
        setImageModalOpen(false);
        if (editorRef) {
            editorRef.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    selection.insertNodes([$createImageNode({ src: url, alt: key })]);
                }
            });
        }
    }, [editorRef]);

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                <ToolbarPlugin dataService={dataService} onOpenImageModal={handleOpenImageModal} setEditorRef={setEditorRef} />
                <TablePlugin />
                <RichTextPlugin
                    contentEditable={<ContentEditable className="editor-input" />}
                    placeholder={<div className="editor-placeholder">Enter text...</div>}
                    ErrorBoundary={({ children }) => <>{children}</>}
                />
                <OnChangePlugin onChange={handleChange} />
                <HistoryPlugin />
                <SelectImageModal dataService={dataService} isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} onSelect={handleSelectImage} />
            </div>
        </LexicalComposer>
    );
};

export default Editor;
