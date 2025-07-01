import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TABLE_COMMAND, $createTableNodeWithDimensions } from '@lexical/table';
import {$getSelection, $isRangeSelection} from "lexical";
import { Paper } from '@mui/material';
import './TablePlugin.css';
import { $createParagraphNode } from 'lexical';

const TablePlugin: React.FC = () => {
   const [editor] = useLexicalComposerContext();

    useEffect(() => {

        return editor.registerCommand(
            INSERT_TABLE_COMMAND,
            (payload) => {
                const { rows, columns } = payload;
                editor.update(() => {
                    const tableNode = $createTableNodeWithDimensions(Number(rows), Number(columns));
                    const selection = editor.getEditorState().read(() => $getSelection());
                    if ($isRangeSelection(selection)) {
                        selection.insertNodes([tableNode]);
                        // Insert a new paragraph after the table and move cursor
                        const paragraph = $createParagraphNode();
                        tableNode.insertAfter(paragraph);
                        paragraph.select();
                    }
                });
                return true;
            },
            0
        );
    }, [editor]);

    return <div className="table-plugin" />;
};

export default TablePlugin;
