import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getTableCellNodeFromLexicalNode,
    $insertTableRow,
    $insertTableColumn,
    $getElementForTableNode,
    TableNode,
    INSERT_TABLE_COMMAND,
    $deleteTableRow__EXPERIMENTAL,
    $deleteTableColumn
} from '@lexical/table';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, TextFormatType, RangeSelection } from 'lexical';
import { HeadingNode, HeadingTagType } from '@lexical/rich-text';
import { TextNode } from 'lexical';
import './Editor.css';
import { $createImageNode } from './ImageNode';
import { config } from '../config';
import {ICMSCrudService} from "../helpers/ICMSCrudService";

interface ToolbarPluginProps  {
    onOpenImageModal?: () => void;
    setEditorRef?: (editor: any) => void;
    dataService: ICMSCrudService;
}

const ToolbarPlugin: React.FC<ToolbarPluginProps> = (props) => {
    const { onOpenImageModal, setEditorRef, dataService } = props;
    const [editor] = useLexicalComposerContext();
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
    const [activeAlignment, setActiveAlignment] = useState<string | null>(null);

    useEffect(() => {
        if (setEditorRef) setEditorRef(editor);
    }, [editor, setEditorRef]);

    // useEffect(() => {
    //     return editor.registerUpdateListener(() => {
    //         editor.getEditorState().read(() => {
    //             const selection = $getSelection();
    //             if ($isRangeSelection(selection)) {
    //                 const rangeSelection = selection as RangeSelection;
    //                 setActiveFormats(rangeSelection.getFormat());
    //                 setActiveAlignment(rangeSelection.getStyle() || null);
    //             } else {
    //                 setActiveFormats(new Set());
    //                 setActiveAlignment(null);
    //             }
    //         });
    //     });
    // }, [editor]);

    const formatText = (format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const alignText = (alignment: 'left' | 'center' | 'right' | 'justify') => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
    };

    const addTable = () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: String(3), columns: String(3), includeHeaders: true });
    };

    const addRow = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const rangeSelection = selection as RangeSelection;
                const tableCellNode = $getTableCellNodeFromLexicalNode(rangeSelection.anchor.getNode());
                if (tableCellNode) {
                    const parentNode = tableCellNode.getParentOrThrow().getParentOrThrow();
                    if (parentNode instanceof TableNode) {
                        const rowIndex = tableCellNode.getIndexWithinParent();
                        const tableDom = $getElementForTableNode(editor, parentNode);
                        $insertTableRow(parentNode, rowIndex, true, 1, tableDom);
                    }
                }
            }
        });
    };

    const addColumn = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const rangeSelection = selection as RangeSelection;
                const tableCellNode = $getTableCellNodeFromLexicalNode(rangeSelection.anchor.getNode());
                if (tableCellNode) {
                    const parentNode = tableCellNode.getParentOrThrow().getParentOrThrow();
                    if (parentNode instanceof TableNode) {
                        const columnIndex = tableCellNode.getIndexWithinParent();
                        const tableDom = $getElementForTableNode(editor, parentNode);
                        $insertTableColumn(parentNode, columnIndex, true, 1, tableDom);
                    }
                }
            }
        });
    };

    const deleteRow = () => {
        editor.update(() => {
            $deleteTableRow__EXPERIMENTAL();
        });
    };

    const deleteColumn = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const rangeSelection = selection as RangeSelection;
                const tableCellNode = $getTableCellNodeFromLexicalNode(rangeSelection.anchor.getNode());
                if (tableCellNode) {
                    const parentNode = tableCellNode.getParentOrThrow().getParentOrThrow();
                    if (parentNode instanceof TableNode) {
                        const columnIndex = tableCellNode.getIndexWithinParent();
                        const tableDom = $getElementForTableNode(editor, parentNode);
                        $deleteTableColumn(parentNode, columnIndex);
                    }
                }
            }
        });
    };

    const handleHeadingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const headingLevel = event.target.value as HeadingTagType;
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                nodes.forEach((node) => {
                    const headingNode = new HeadingNode(headingLevel);
                    headingNode.append(new TextNode(node.getTextContent()));
                    node.replace(headingNode);
                });
            }
        });
    };

    // Image upload/select/link handlers
    const handleUploadImage = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const key = `${config.MediaPrefix}${Date.now()}_${file.name}`;
            //const svc = dataService as AWSCMSCrudSvc;
            await dataService.createMedia(config.StageBucket, key, data, file.type);
            const url = `${config.MediaProxy}/${key}`;
            editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                // Insert image node at the current selection
                const rangeSelection = selection as RangeSelection;
                if (rangeSelection.isCollapsed()) {
                    // If selection is collapsed, insert at the cursor
                    rangeSelection.insertNodes([$createImageNode({ src: url, alt: file.name })]);
                } else {
                    // If selection is not collapsed, replace the selected text with the image
                    rangeSelection.getNodes().forEach(node => {
                        if (node instanceof TextNode) {
                            node.replace($createImageNode({ src: url, alt: file.name }));
                        }
                    });
                }
            });
        };
        input.click();
    };

    const handleLinkImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                // Insert image node at the current selection
                const rangeSelection = selection as RangeSelection;
                if (rangeSelection.isCollapsed()) {
                    // If selection is collapsed, insert at the cursor
                    rangeSelection.insertNodes([$createImageNode({ src: url })]);
                } else {
                    // If selection is not collapsed, replace the selected text with the image
                    rangeSelection.getNodes().forEach(node => {
                        if (node instanceof TextNode) {
                            node.replace($createImageNode({ src: url }));
                        }
                    });
                }

            });
        }
    };

    const handleSelectImage = () => {
        if (onOpenImageModal) onOpenImageModal();
    };

    return (
        <div className="toolbar">
            <div className="toolbar-group">
                <select onChange={handleHeadingChange} className="toolbar-item" aria-label="Heading Level">
                    <option value="p">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="h5">Heading 5</option>
                </select>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
                <button
                    onClick={() => formatText('bold')}
                    className={`toolbar-item spaced ${activeFormats.has('bold') ? 'active' : ''}`}
                >
                    <i className="format icon-bold" />
                </button>
                <button
                    onClick={() => formatText('italic')}
                    className={`toolbar-item `}
                >
                    <i className="icon-italic format" />
                </button>
                <button
                    onClick={() => formatText('underline')}
                    className={`toolbar-item spaced ${activeFormats.has('underline') ? 'active' : ''}`}
                >
                    <i className="icon-underline format" />
                </button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
                <button
                    onClick={() => alignText('left')}
                    className={`toolbar-item spaced ${activeAlignment === 'left' ? 'active' : ''}`}
                >
                    <i className="icon-align-left format" />
                </button>
                <button
                    onClick={() => alignText('center')}
                    className={`toolbar-item spaced ${activeAlignment === 'center' ? 'active' : ''}`}
                >
                    <i className="icon-align-center format" />
                </button>
                <button
                    onClick={() => alignText('right')}
                    className={`toolbar-item spaced ${activeAlignment === 'right' ? 'active' : ''}`}
                >
                    <i className="icon-align-right format" />
                </button>
                <button
                    onClick={() => alignText('justify')}
                    className={`toolbar-item spaced ${activeAlignment === 'justify' ? 'active' : ''}`}
                >
                    <i className="icon-justify format" />
                </button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
                <button onClick={addTable} className="toolbar-item spaced"><i className="icon-add-table format" /></button>
                <button onClick={addRow} className="toolbar-item spaced"><i className="icon-add-row format" /></button>
                <button onClick={addColumn} className="toolbar-item spaced"><i className="icon-add-column format" /></button>
                <button onClick={deleteRow} className="toolbar-item spaced"><i className="icon-delete-row format" /></button>
                <button onClick={deleteColumn} className="toolbar-item spaced"><i className="icon-delete-column format" /></button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
                <button onClick={handleUploadImage} className="toolbar-item spaced" title="Upload Image">
                    <i className="icon-add-image format" />
                </button>
                <button onClick={handleSelectImage} className="toolbar-item spaced" title="Select Image">
                    <i className="icon-select-image format" />
                </button>
                <button onClick={handleLinkImage} className="toolbar-item spaced" title="Link Image">
                    <i className="icon-link-image format" />
                </button>
            </div>
        </div>
    );
};

export default ToolbarPlugin;
