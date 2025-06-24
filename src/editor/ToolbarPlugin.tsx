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
import { v4 as uuidv4 } from 'uuid';
import SaveIcon from '../icons/save.svg';
import LoadIcon from '../icons/load.svg';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';

const Dropdown: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({ label, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="toolbar-dropdown" onBlur={() => setOpen(false)} tabIndex={0}>
            <button className="toolbar-item spaced" onClick={() => setOpen((v) => !v)} type="button">{label}</button>
            {open && <div className="toolbar-dropdown-menu">{children}</div>}
        </div>
    );
};

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
    const [loadModalOpen, setLoadModalOpen] = useState(false);
    const [postKeys, setPostKeys] = useState<string[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadError, setLoadError] = useState<string|null>(null);

    useEffect(() => {
        if (setEditorRef) setEditorRef(editor);
    }, [editor, setEditorRef]);


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

    // Save editor content as JSON to S3
    const handleSavePost = async () => {
        const editorState = editor.getEditorState();
        const json = editorState.toJSON();
        const guid = uuidv4();
        const key = `${config.StagePrefix || ''}${guid}.json`;
        console.log(`Saving post to ${key}`);
        console.log(JSON.stringify(json));
        await dataService.create(config.StageBucket, key, json);
        window.alert(`Post saved as ${key}`);
    };

    // Load editor content from S3 and set in editor
    const handleOpenLoadModal = () => setLoadModalOpen(true);

    const handleSelectPost = async (key: string) => {
        setLoadModalOpen(false);
        try {
            console.log(`Selecting post ${key}`);
            const json = await dataService.read(config.StageBucket, key);
            console.log(`Selected post ${key}`);
            editor.setEditorState(editor.parseEditorState(JSON.stringify(json)));
            window.alert('Post loaded!');
        } catch (e) {
            window.alert('Failed to load post.');
        }
    };

    // Modal for selecting a post to load
    const LoadPostModal: React.FC<{
      isOpen: boolean;
      onClose: () => void;
      onSelect: (key: string) => void;
      dataService: ICMSCrudService;
    }> = ({ isOpen, onClose, onSelect, dataService }) => {
      const [postKeys, setPostKeys] = useState<string[]>([]);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [selectedKey, setSelectedKey] = useState<string | null>(null);
      const [meta, setMeta] = useState<Record<string, any>>({});

      useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError(null);
        dataService.listMedia(config.StageBucket, config.StagePrefix || '')
          .then(keys => {
            const jsonKeys = keys.filter(k => k.endsWith('.json'));
            setPostKeys(jsonKeys);
            // Optionally fetch meta for each post (e.g. first 1KB of each file)
            Promise.all(jsonKeys.map(async key => {
              try {
                const json = await dataService.read(config.StageBucket, key);
                const meta = (json && typeof json === 'object' && 'meta' in json && (json as any).meta) ? (json as any).meta : {};
                return { key, meta };
              } catch {
                return { key, meta: {} };
              }
            })).then(results => {
              const metaObj: Record<string, any> = {};
              results.forEach(({ key, meta }) => { metaObj[key] = meta; });
              setMeta(metaObj);
            });
            setLoading(false);
          })
          .catch(e => {
            setError(e.message);
            setLoading(false);
          });
      }, [isOpen]);

      if (!isOpen) return null;

      return (
        <div className="select-image-modal-backdrop">
          <div className="select-image-modal">
            <button className="close-btn" onClick={onClose}>×</button>
            <h2>Select a Post</h2>
            {loading && <div>Loading posts...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div className="image-gallery">
              {postKeys.map(key => (
                <div key={key} className={`image-thumb${selectedKey === key ? ' selected' : ''}`} onClick={() => setSelectedKey(key)} title={key}>
                  <div style={{fontSize:12,wordBreak:'break-all',marginBottom:4}}>{meta[key]?.title || key}</div>
                  {meta[key]?.date && <div style={{fontSize:11, color:'#888'}}>{meta[key].date}</div>}
                </div>
              ))}
              {(!loading && postKeys.length === 0 && !error) && <div>No posts found.</div>}
            </div>
            <div style={{ marginTop: 20 }}>
              <button
                disabled={!selectedKey}
                onClick={() => selectedKey && onSelect(selectedKey)}
                style={{ marginLeft: 10 }}
              >
                Load Post
              </button>
            </div>
          </div>
          <style>{`
            .select-image-modal-backdrop {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.4);
              z-index: 1000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .select-image-modal {
              background: #fff;
              border-radius: 10px;
              padding: 2rem 2.5rem 1.5rem 2.5rem;
              min-width: 350px;
              max-width: 90vw;
              max-height: 90vh;
              overflow-y: auto;
              box-shadow: 0 8px 32px rgba(0,0,0,0.18);
              position: relative;
            }
            .close-btn {
              position: absolute;
              top: 1rem;
              right: 1rem;
              background: none;
              border: none;
              font-size: 2rem;
              color: #888;
              cursor: pointer;
              transition: color 0.2s;
            }
            .close-btn:hover {
              color: #222;
            }
            .image-gallery {
              display: flex;
              flex-wrap: wrap;
              gap: 18px;
              margin-top: 1.5rem;
              justify-content: flex-start;
            }
            .image-thumb {
              width: 180px;
              height: 60px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              background: #f7f7f7;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: center;
              cursor: pointer;
              border: 2px solid transparent;
              transition: border 0.2s, box-shadow 0.2s;
              padding: 8px 10px;
            }
            .image-thumb.selected {
              border: 2px solid #0078d4;
              box-shadow: 0 4px 16px rgba(0,120,212,0.12);
            }
            .image-thumb:hover {
              border: 2px solid #0078d4;
              box-shadow: 0 4px 16px rgba(0,120,212,0.12);
            }
            .select-image-modal h2 {
              margin-top: 0;
              font-size: 1.3rem;
              font-weight: 600;
              color: #222;
            }
          `}</style>
        </div>
      );
    };

    return (
        <div className="toolbar">
            <div className="toolbar-group">
                <Dropdown label={<span><i className="icon-bold format" style={{opacity:0}}/>Format</span>}>
                    <button className="toolbar-dropdown-item" onMouseDown={() => handleHeadingChange({target:{value:'p'}} as any)}>Normal</button>
                    <button className="toolbar-dropdown-item" onMouseDown={() => handleHeadingChange({target:{value:'h1'}} as any)}>Heading 1</button>
                    <button className="toolbar-dropdown-item" onMouseDown={() => handleHeadingChange({target:{value:'h2'}} as any)}>Heading 2</button>
                    <button className="toolbar-dropdown-item" onMouseDown={() => handleHeadingChange({target:{value:'h3'}} as any)}>Heading 3</button>
                    <button className="toolbar-dropdown-item" onMouseDown={() => handleHeadingChange({target:{value:'h4'}} as any)}>Heading 4</button>
                    <button className="toolbar-dropdown-item" onMouseDown={() => handleHeadingChange({target:{value:'h5'}} as any)}>Heading 5</button>
                    <button className="toolbar-dropdown-item" onMouseDown={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><i className="icon-bulleted-list format"/> Bulleted List</button>
                    <button className="toolbar-dropdown-item" onMouseDown={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><i className="icon-numbered-list format"/> Numbered List</button>
                </Dropdown>
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
                <Dropdown label={<span><i className="icon-add-image format"/> Image</span>}>
                    <button className="toolbar-dropdown-item" onMouseDown={handleUploadImage}><i className="icon-add-image format"/> Upload Image</button>
                    <button className="toolbar-dropdown-item" onMouseDown={handleSelectImage}><i className="icon-select-image format"/> Select Image</button>
                    <button className="toolbar-dropdown-item" onMouseDown={handleLinkImage}><i className="icon-link-image format"/> Link Image</button>
                </Dropdown>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
                <Dropdown label={<span><i className="icon-add-table format"/> Table</span>}>
                    <button className="toolbar-dropdown-item" onMouseDown={addTable}><i className="icon-add-table format"/> Add Table</button>
                    <button className="toolbar-dropdown-item" onMouseDown={addRow}><i className="icon-add-row format"/> Add Row</button>
                    <button className="toolbar-dropdown-item" onMouseDown={addColumn}><i className="icon-add-column format"/> Add Column</button>
                    <button className="toolbar-dropdown-item" onMouseDown={deleteRow}><i className="icon-delete-row format"/> Delete Row</button>
                    <button className="toolbar-dropdown-item" onMouseDown={deleteColumn}><i className="icon-delete-column format"/> Delete Column</button>
                </Dropdown>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
                <button onClick={handleSavePost} className="toolbar-item spaced" title="Save Post">
                    <i className="icon-save format toolbar-icon" />
                </button>
                <button onClick={handleOpenLoadModal} className="toolbar-item spaced" title="Load Post">
                    <i className="icon-load format toolbar-icon" />
                </button>
            </div>
            <LoadPostModal isOpen={loadModalOpen} onClose={() => setLoadModalOpen(false)} onSelect={handleSelectPost} dataService={dataService} />
        </div>
    );
};

export default ToolbarPlugin;
