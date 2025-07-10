import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getTableCellNodeFromLexicalNode,
    $insertTableRowAtSelection,
    $insertTableColumnAtSelection,
    $deleteTableColumnAtSelection,
    TableNode,
    INSERT_TABLE_COMMAND
} from '@lexical/table';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, TextFormatType, RangeSelection } from 'lexical';
import { HeadingNode, HeadingTagType } from '@lexical/rich-text';
import { TextNode } from 'lexical';
import './Editor.css';
import { $createImageNode } from './ImageNode';
import { config } from '../config';
import {ICMSCrudService} from "../helpers/ICMSCrudService";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { Box, Button, IconButton, Menu, MenuItem, Tooltip, Divider } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TableChartIcon from '@mui/icons-material/TableChart';
import UploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LinkIcon from '@mui/icons-material/Link';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TableRowsIcon from '@mui/icons-material/TableRows';
import TableColumnsIcon from '@mui/icons-material/ViewColumn';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CodeIcon from '@mui/icons-material/Code';
import DownloadIcon from '@mui/icons-material/Download';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $createParagraphNode } from 'lexical';
import SavePostModal from './SavePostModal';
import GenerateImageModal from './GenerateImageModal';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Define type for saved post data
interface SavedPostData {
  meta: { title: string; author: string; dateSaved: string };
  content: any;
}



interface ToolbarPluginProps  {
    onOpenImageModal?: () => void;
    setEditorRef?: (editor: any) => void;
    dataService: ICMSCrudService;
    onPostLoaded?: (post: SavedPostData) => void;
}

const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ onOpenImageModal, setEditorRef, dataService, onPostLoaded }) => {
    const [editor] = useLexicalComposerContext();
    const [headingAnchorEl, setHeadingAnchorEl] = useState<null | HTMLElement>(null);
    const [tableAnchorEl, setTableAnchorEl] = useState<null | HTMLElement>(null);
    const [imageAnchorEl, setImageAnchorEl] = useState<null | HTMLElement>(null);
    const [heading, setHeading] = useState<'normal' | HeadingTagType>('normal');
    const [loadModalOpen, setLoadModalOpen] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [lastSavedMeta, setLastSavedMeta] = useState<{ title?: string; author?: string; dateSaved?: string } | null>(null);
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Handler for generating image with Bedrock
    const handleGenerateImage = async (prompt: string, size: string) => {
        setGenerating(true);
        try {
            // Call AWS Crud Svc to generate image with Bedrock
            // This assumes dataService.generateImageWithBedrock exists and returns the image URL or blob
            const imageUrl = await dataService.generateImageWithBedrock(prompt, size);
            // Fetch the image as a blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            // Create a file name
            const fileName = `bedrock-${Date.now()}.png`;
            // Upload to S3 using dataService
            await dataService.uploadImageBlob(config.StageBucket, config.StagePrefix + fileName, blob);
            window.alert('Image generated and uploaded to S3!');
            setGenerateModalOpen(false);
            // Optionally, refresh image selection modal or state here
        } catch (e: any) {
            window.alert('Failed to generate or upload image: ' + (e && e.message ? e.message : e));
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        if (setEditorRef) setEditorRef(editor);
    }, [editor, setEditorRef]);


    const formatText = (format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const addTable = () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: String(3), columns: String(3), includeHeaders: true });
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Insert a new paragraph after the table and move cursor
                const paragraph = $createParagraphNode();
                selection.insertNodes([paragraph]);
                paragraph.select();
            }
        });
    };

    // Fix addRow, addColumn, deleteRow, deleteColumn to use correct Lexical Table API for current version
    const addRow = () => {
      editor.update(() => {
        // Use the new API: $insertTableRowAtSelection
        $insertTableRowAtSelection(true); // true = insert after selection
      });
    };
    const addColumn = () => {
      editor.update(() => {
        // Use the new API: $insertTableColumnAtSelection
        $insertTableColumnAtSelection(true); // true = insert after selection
      });
    };
    const deleteRow = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const tableCellNode = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
          if (tableCellNode) {
            const tableRowNode = tableCellNode.getParent();
            const tableNode = tableRowNode && typeof tableRowNode.getParent === 'function' ? tableRowNode.getParent() : null;
            if (tableNode instanceof TableNode && tableRowNode) {
              const rowIndex = tableRowNode.getIndexWithinParent();
              if (rowIndex >= 0) {
                const rows = tableNode.getChildren();
                if (rows[rowIndex]) rows[rowIndex].remove();
              }
            }
          }
        }
      });
    };
    const deleteColumn = () => {
      editor.update(() => {
        // Use the new API: $deleteTableColumnAtSelection
        $deleteTableColumnAtSelection();
      });
    };

    const handleHeadingChange = (event: { target: { value: string } }) => {
      const headingLevel = event.target.value;
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach((node) => {
            if (headingLevel === 'normal') {
              // If node's parent is a HeadingNode, replace the parent
              const parent = node.getParent();
              if (parent instanceof HeadingNode) {
                const paragraphNode = $createParagraphNode();
                paragraphNode.append(new TextNode());
                parent.replace(paragraphNode,true);
              } else {
                // fallback: replace node itself
                const paragraphNode = $createParagraphNode();
                paragraphNode.append(new TextNode(node.getTextContent()));
                node.replace(paragraphNode);
              }
            } else {
              // Set as heading
              const headingNode = new HeadingNode(headingLevel as HeadingTagType);
              headingNode.append(new TextNode(node.getTextContent()));
              node.replace(headingNode);
            }
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
            await dataService.createMedia(config.StageBucket, key, data, file.type);
            const url = `${config.MediaProxy}/${key}`;
            editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                const rangeSelection = selection as RangeSelection;
                let imageNode;
                if (rangeSelection.isCollapsed()) {
                    imageNode = $createImageNode({ src: url, alt: file.name });
                    rangeSelection.insertNodes([imageNode]);
                } else {
                    rangeSelection.getNodes().forEach(node => {
                        if (node instanceof TextNode) {
                            imageNode = $createImageNode({ src: url, alt: file.name });
                            node.replace(imageNode);
                        }
                    });
                }
                // Insert a new paragraph after the image and move cursor
                if (imageNode) {
                    const paragraph = $createParagraphNode();
                    imageNode.insertAfter(paragraph);
                    paragraph.select();
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
                const rangeSelection = selection as RangeSelection;
                let imageNode;
                if (rangeSelection.isCollapsed()) {
                    imageNode = $createImageNode({ src: url });
                    rangeSelection.insertNodes([imageNode]);
                } else {
                    rangeSelection.getNodes().forEach(node => {
                        if (node instanceof TextNode) {
                            imageNode = $createImageNode({ src: url });
                            node.replace(imageNode);
                        }
                    });
                }
                // Insert a new paragraph after the image and move cursor
                if (imageNode) {
                    const paragraph = $createParagraphNode();
                    imageNode.insertAfter(paragraph);
                    paragraph.select();
                }
            });
        }
    };

    const handleSelectPost = async (key: string) => {
        try {
            const postData = await dataService.read(config.StageBucket, key) as SavedPostData;
            if (onPostLoaded) onPostLoaded(postData);
            editor.setEditorState(editor.parseEditorState(JSON.stringify(postData.content)));
            setLastSavedMeta(postData.meta || null);
            window.alert('Post loaded!');
        } catch (e) {
            window.alert('Failed to load post.');
        }
    };

    const handleSavePost = () => {
        setSaveModalOpen(true);
    };

    const handleSaveModalClose = () => {
        setSaveModalOpen(false);
    };

    const handleSaveModalSave = async (meta: { title: string; author: string }) => {
        setSaveModalOpen(false);
        const dateSaved = new Date().toISOString();
        const editorState = editor.getEditorState();
        const content = editorState.toJSON();
        const postData: SavedPostData = {
            meta: { ...meta, dateSaved },
            content
        };
        const key = `${config.StagePrefix || ''}${Date.now()}.json`;
        await dataService.create(config.StageBucket, key, postData);
        setLastSavedMeta(postData.meta);
        window.alert(`Post saved as ${key}`);
    };

    // Add code block formatting
    const formatCodeBlock = () => {
      editor.update(() => {
        const selection = $getSelection();
        let codeNode;
        if ($isRangeSelection(selection)) {
          codeNode = $createCodeNode('javascript');
          codeNode.append(new TextNode(selection?.getTextContent()));
          selection.insertNodes([codeNode]);
          // Insert a new paragraph after the code block and move cursor
          const paragraph = $createParagraphNode();
          codeNode.insertAfter(paragraph);
          paragraph.select();
        }
      });
    };

    // Handler to publish as HTML
    const handlePublishAsHtml = async () => {
        let htmlString = '';
        editor.getEditorState().read(() => {
            htmlString = $generateHtmlFromNodes(editor, null);
        });
        if (!lastSavedMeta || !lastSavedMeta.title || !lastSavedMeta.author || !lastSavedMeta.dateSaved) {
            window.alert('Please save your post first to set the title, author, and date.');
            return;
        }
        const meta = lastSavedMeta;
        const safeTitle = (meta.title || 'untitled')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const fullHtml = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>${meta.title}</title>\n<meta name=\"author\" content=\"${meta.author}\">\n<meta name=\"date\" content=\"${meta.dateSaved}\">\n</head>\n<body>\n${htmlString}\n</body>\n</html>`;
        const key = `published/${safeTitle}.html`;
        try {
            await dataService.createHTML(config.StageBucket, key,fullHtml);
            window.alert(`HTML published to S3 as ${key}`);
        } catch (e: any) {
            window.alert('Failed to publish HTML to S3: ' + (e && e.message ? e.message : e));
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
                  <div style={{fontSize:14, fontWeight:'bold', wordBreak:'break-all', marginBottom:2}}>{meta[key]?.title || key}</div>
                  <div style={{fontSize:12, color:'#555', marginBottom:2}}>{meta[key]?.author || ''}</div>
                  {meta[key]?.dateSaved && <div style={{fontSize:11, color:'#888'}}>{meta[key].dateSaved}</div>}
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #eee', mb: 1, pb: 1 }}>
        {/* Save/Load Icons */}
        <Tooltip title="Save Post">
          <IconButton size="small" onClick={handleSavePost} color="primary">
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Load Post">
          <IconButton size="small" onClick={() => setLoadModalOpen(true)} color="primary">
            <FolderOpenIcon />
          </IconButton>
        </Tooltip>
        {/* Divider after Save/Load */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        {/* Heading Dropdown */}
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowDropDownIcon />}
          onClick={e => setHeadingAnchorEl(e.currentTarget)}
        >
          {heading === 'normal' ? 'Normal' : heading.toUpperCase()}
        </Button>
        <Menu anchorEl={headingAnchorEl} open={Boolean(headingAnchorEl)} onClose={() => setHeadingAnchorEl(null)}>
          <MenuItem onClick={() => { setHeading('normal'); setHeadingAnchorEl(null); handleHeadingChange({ target: { value: 'normal' } } as any); }}>Normal</MenuItem>
          <MenuItem onClick={() => { setHeading('h1'); setHeadingAnchorEl(null); handleHeadingChange({ target: { value: 'h1' } } as any); }}>H1</MenuItem>
          <MenuItem onClick={() => { setHeading('h2'); setHeadingAnchorEl(null); handleHeadingChange({ target: { value: 'h2' } } as any); }}>H2</MenuItem>
          <MenuItem onClick={() => { setHeading('h3'); setHeadingAnchorEl(null); handleHeadingChange({ target: { value: 'h3' } } as any); }}>H3</MenuItem>
            <MenuItem onClick={() => { setHeading('h4'); setHeadingAnchorEl(null); handleHeadingChange({ target: { value: 'h4' } } as any); }}>H4</MenuItem>
            <MenuItem onClick={() => { setHeading('h5'); setHeadingAnchorEl(null); handleHeadingChange({ target: { value: 'h5' } } as any); }}>H5</MenuItem>
            <MenuItem onClick={() => { setHeading('h6'); setHeadingAnchorEl(null); handleHeadingChange({ target: { value: 'h6' } } as any); }}>H6</MenuItem>

        </Menu>
        {/* Bold, Italic, Underline, Code */}
        <Tooltip title="Bold">
          <Button variant="outlined" size="small" onClick={() => formatText('bold')} color="primary">B</Button>
        </Tooltip>
        <Tooltip title="Italic">
          <Button variant="outlined" size="small" onClick={() => formatText('italic')} color="primary">I</Button>
        </Tooltip>
        <Tooltip title="Underline">
          <Button variant="outlined" size="small" onClick={() => formatText('underline')} color="primary">U</Button>
        </Tooltip>
        <Tooltip title="Code Block">
          <IconButton size="small" onClick={formatCodeBlock} color="primary">
            <CodeIcon />
          </IconButton>
        </Tooltip>
        {/* Bulleted List */}
        <Tooltip title="Bulleted List">
          <IconButton size="small" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
            <FormatListBulletedIcon />
          </IconButton>
        </Tooltip>
        {/* Numbered List */}
        <Tooltip title="Numbered List">
          <IconButton size="small" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
            <FormatListNumberedIcon />
          </IconButton>
        </Tooltip>
        {/* Image Dropdown */}
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowDropDownIcon />}
          onClick={e => setImageAnchorEl(e.currentTarget)}
        >
          Image
        </Button>
        <Menu anchorEl={imageAnchorEl} open={Boolean(imageAnchorEl)} onClose={() => setImageAnchorEl(null)}>
          <MenuItem onClick={() => { setImageAnchorEl(null); if (onOpenImageModal) onOpenImageModal(); }}>
            <InsertPhotoIcon fontSize="small" sx={{ mr: 1 }} />Select
          </MenuItem>
          <MenuItem onClick={() => { setImageAnchorEl(null); handleUploadImage(); }}>
            <UploadIcon fontSize="small" sx={{ mr: 1 }} />Upload
          </MenuItem>
          <MenuItem onClick={() => { setImageAnchorEl(null); handleLinkImage(); }}>
            <LinkIcon fontSize="small" sx={{ mr: 1 }} />Link
          </MenuItem>
        </Menu>
        {/* Table Dropdown */}
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowDropDownIcon />}
          onClick={e => setTableAnchorEl(e.currentTarget)}
        >
          Table
        </Button>
        <Menu anchorEl={tableAnchorEl} open={Boolean(tableAnchorEl)} onClose={() => setTableAnchorEl(null)}>
          <MenuItem onClick={() => { setTableAnchorEl(null); addTable(); }}>
            <TableChartIcon fontSize="small" sx={{ mr: 1 }} />Add Table
          </MenuItem>
          <MenuItem onClick={() => { setTableAnchorEl(null); addRow(); }}>
            <TableRowsIcon fontSize="small" sx={{ mr: 1 }} />Add Row
          </MenuItem>
          <MenuItem onClick={() => { setTableAnchorEl(null); addColumn(); }}>
            <TableColumnsIcon fontSize="small" sx={{ mr: 1 }} />Add Column
          </MenuItem>
          <MenuItem onClick={() => { setTableAnchorEl(null); deleteRow(); }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />Delete Row
          </MenuItem>
          <MenuItem onClick={() => { setTableAnchorEl(null); deleteColumn(); }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />Delete Column
          </MenuItem>
        </Menu>
        {/* Publish as HTML Button */}
        <Tooltip title="Publish as HTML">
          <IconButton onClick={handlePublishAsHtml} size="small">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        {/* Generate Image Icon */}
        <Tooltip title="Generate Image with AI">
          <IconButton size="small" onClick={() => setGenerateModalOpen(true)} color="primary">
            <AutoAwesomeIcon />
          </IconButton>
        </Tooltip>
        <GenerateImageModal
          open={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          onGenerate={handleGenerateImage}
          loading={generating}
        />
        <LoadPostModal isOpen={loadModalOpen} onClose={() => setLoadModalOpen(false)} onSelect={handleSelectPost} dataService={dataService} />
        <SavePostModal open={saveModalOpen} onClose={handleSaveModalClose} onSave={handleSaveModalSave} />
      </Box>
    );
};

export default ToolbarPlugin;
