import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import CatalogSelectModal from '../components/CatalogSelectModal';
import {
    $getTableCellNodeFromLexicalNode,
    $insertTableRowAtSelection,
    $insertTableColumnAtSelection,
    $deleteTableColumnAtSelection,
    TableNode,
    INSERT_TABLE_COMMAND
} from '@lexical/table';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    TextFormatType,
    RangeSelection,
    ParagraphNode,
    $isElementNode,
    $isTextNode
} from 'lexical';
import { HeadingNode, HeadingTagType } from '@lexical/rich-text';
import { TextNode } from 'lexical';
import './Editor.css';
import { $createImageNode } from './ImageNode';
import { config } from '../config';
import {ICMSCrudService, MetaData} from "../helpers/ICMSCrudService";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { Box, Button, IconButton, Menu, MenuItem, Tooltip, Divider, Link, Typography } from '@mui/material';
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
import PublishIcon from '@mui/icons-material/Publish';
import SendIcon from '@mui/icons-material/Send';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $createParagraphNode } from 'lexical';
import SavePostModal from './SavePostModal';
import HyperlinkModal from './HyperlinkModal';
import GenerateImageModal from './GenerateImageModal';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {Utils} from "../helpers/Utils";
import {TOGGLE_LINK_COMMAND, $isLinkNode, $createLinkNode, LinkNode} from '@lexical/link';

// Define type for saved post data
interface SavedPostData {
  id?: string;
  template?: string;
  title?: string;
  category?: string;
  published?: boolean;
  postInfo?: {
    author: string;
    posted: string;
  };
  content?: {
    type: string;
    body: string;
  } | any;
  media?: Array<{
    name: string;
    description: string;
    type: string;
    order: number;
    tags: string[];
    key: string;
  }>;
  postKey?: string;
  src?: string;
  published_data?: {
    id: string;
    key: string;
    published_date: string;
  };
  srcVersion?: string;
  key?: string;
  meta: { title: string; author: string; dateSaved: string };
  // New fields for version 4
  released?: boolean;
  preview?: {
    catalogEntryUri: string;
  };
  release?: {
    catalogEntryUri: string;
    source: string;
  };
  preview_event?: {
    post_id: string;
    post_key: string;
    post_srcVersion: string;
    post_srcKey: string;
    post_uri: string;
    post_state: string;
    source: string;
  };
  published_event?: {
    post_id: string;
    post_key: string;
    post_srcVersion: string;
    post_srcKey: string;
    post_uri: string;
    post_state: string;
    source: string;
  };
  // New fields for version 5
  catalog_id?: string;
  catalog_title?: string;
}



interface ToolbarPluginProps  {
    onOpenImageModal?: () => void;
    setEditorRef?: (editor: any) => void;
    dataService: ICMSCrudService;
    onPostLoaded?: (post: SavedPostData) => void;
    setIsPolling?: (isPolling: boolean) => void;
}

const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ onOpenImageModal, setEditorRef, dataService, onPostLoaded, setIsPolling }) => {
    const [editor] = useLexicalComposerContext();
    const [headingAnchorEl, setHeadingAnchorEl] = useState<null | HTMLElement>(null);
    const [tableAnchorEl, setTableAnchorEl] = useState<null | HTMLElement>(null);
    const [imageAnchorEl, setImageAnchorEl] = useState<null | HTMLElement>(null);
    const [heading, setHeading] = useState<'normal' | HeadingTagType>('normal');
    const [loadModalOpen, setLoadModalOpen] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [lastSavedPost, setLastSavedPost] = useState<SavedPostData | null>(null);
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [catalogSelectModalOpen, setCatalogSelectModalOpen] = useState(false);
    const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
    const [selectedCatalogTitle, setSelectedCatalogTitle] = useState<string | null>(null);
    const [hyperlinkModalOpen, setHyperlinkModalOpen] = useState(false);
    const [hyperlinkData, setHyperlinkData] = useState<{ url: string; text: string; isEditing: boolean }>({ 
        url: '', 
        text: '', 
        isEditing: false 
    });

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
              // headingNode.append(new TextNode(node.getTextContent()));
              const parent = node.getParent();
              if (parent instanceof ParagraphNode) {
                  parent.replace(headingNode,true);
              }else{
                  headingNode.append(new TextNode(node.getTextContent()));
                  node.replace(headingNode);
              }
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

            const url = Utils.cleanURL(config.MediaProxy,key);
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
            let requireSave = false;
            let imageOps: any[] = [];
            // Check for post is published, if so - load latest meta data
            console.log('postData', postData);
            if (postData.published && postData.published_data) {
                // Fetch the latest meta-data
                const metaData = await dataService.getMetaData(postData.id || '');
                console.log('metaData', metaData);
                if (metaData) {
                    postData.preview = metaData.preview;
                    postData.release = metaData.release;
                    postData.released = metaData.released;
                    console.log('Here ...');
                    if (metaData.ai_image_generated && metaData.ai_image_generated_details) {
                        // Loop through the ai_image_generated_details and copy images to the editor stage media if not already in the media object
                        console.log('Here in ai ...');
                        const imageDetail = metaData.ai_image_generated_details;
                        // Ensure postData.media is initialized
                        if (!postData.media) {
                            postData.media = [];
                        }
                        const existingImage = postData.media.find(mediaItem => mediaItem.key === imageDetail.origSrc);
                        if (!existingImage) {
                            console.log('Here in ai ...2');
                            imageOps.push(dataService.copyObject(config.PublishBucket, imageDetail.origSrc, config.StageBucket, imageDetail.origSrc));
                            postData.media.push({
                                name: imageDetail.title,
                                description: imageDetail.description,
                                type: imageDetail.type,
                                order: postData.media.length + 1,
                                tags: [],
                                key: imageDetail.origSrc
                            });
                            requireSave = true;
                        }


                    }
                }
            }
            if (requireSave) {
                // Save the post with updated media
                await Promise.all(imageOps);
                await dataService.update(config.StageBucket, key, postData);
                window.alert('Post media updated with AI generated images.');
            }
            if (onPostLoaded) onPostLoaded(postData);
            editor.setEditorState(editor.parseEditorState(JSON.stringify(postData.content)));
            setLastSavedPost(postData);
            setSelectedCatalogId(postData.catalog_id || '');
            setSelectedCatalogTitle(postData.catalog_title || '');
            window.alert('Post loaded!');
            setLoadModalOpen(false);
        } catch (e) {
            window.alert('Failed to load post.');
            console.log('Failed to load post.',e);
        }
    };

    const handleSavePost = () => {
        // Always show the save modal, even for previously saved posts
        // This allows updating the title of previously saved posts
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

        // Generate a safe title for the key
        const safeTitle = (meta.title || 'untitled')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Use existing ID if available, otherwise generate a new one
        const id = lastSavedPost?.id || uuidv4();
        const postKey = `${id}`;
        const key = `${config.StagePrefix || ''}${postKey}.json`;

        // Generate HTML to parse for images
        let htmlString = '';
        editor.getEditorState().read(() => {
            htmlString = $generateHtmlFromNodes(editor, null);
        });

        // Parse HTML for images
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const imgElements = doc.querySelectorAll('img');

        // Extract image details and create media objects
        const mediaItems: Array<{
            name: string;
            description: string;
            type: string;
            order: number;
            tags: string[];
            key: string;
        }> = [];

        const staged_media = lastSavedPost?.media || [];
        // Iterate over Stage Media and create media objects from Staged Media
        staged_media.forEach((media) => {
            mediaItems.push({
                name: media.name,
                description: media.description,
                type: media.type,
                order: media.order,
                tags: media.tags,
                key: media.key
            });
        });
        
        
        imgElements.forEach((img, index) => {
            const src = img.getAttribute('src') || '';
            const alt = img.getAttribute('alt') || '';

            // Extract the key from the src URL if it's a media URL
            let key = src;
            if (src.includes(config.MediaProxy)) {
                key = src.replace(`${config.MediaProxy}/`, '');
            }

            // Check if Media item is already present based on key
            const isMediaExist = mediaItems.some(item => item.key === key);
            if (isMediaExist) {
                return; // Skip if media item already exists
            }

            // Create a media object for each image
            mediaItems.push({
                name: alt || `Image ${index + 1}`,
                description: alt || `Image ${index + 1}`,
                type: 'image',
                order: index + 1,
                tags: [],
                key: key
            });
        });

        const postData: SavedPostData = {
            id,
            template: 'basic',
            title: meta.title,
            category: selectedCatalogId || 'general',
            published: false,
            postInfo: {
                author: meta.author,
                posted: dateSaved
            },
            meta: { ...meta, dateSaved },
            content,
            media: mediaItems,
            postKey,
            src: key,
            catalog_id: selectedCatalogId || undefined,
            catalog_title: selectedCatalogTitle || undefined,
        };

        await dataService.create(config.StageBucket, key, postData);
        setLastSavedPost(postData);
        if (onPostLoaded) onPostLoaded(postData);
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
    
    // Hyperlink handlers
    const handleOpenHyperlinkModal = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          let url = '';
          let text = '';
          let isEditing = false;
          
          // Check if selection contains a link node
          for (const node of nodes) {
            if ($isLinkNode(node)) {
              // We're editing an existing link
              url = node.getURL();
              text = node.getTextContent();
              isEditing = true;
              break;
            } else if (node.getParent() && $isLinkNode(node.getParent())) {
              // Text node inside a link node
              const parent = node.getParent() as LinkNode;
              if (parent) {
                url = parent.getURL();
                text = parent.getTextContent();
                isEditing = true;
                break;
              }
            }
          }
          
          // If no link found but text is selected, use it as link text
          if (!isEditing && selection.getTextContent()) {
            text = selection.getTextContent();
          }
          
          setHyperlinkData({ url, text, isEditing });
          setHyperlinkModalOpen(true);
        } else {
          // No selection, create a new link at cursor position
          setHyperlinkData({ url: '', text: '', isEditing: false });
          setHyperlinkModalOpen(true);
        }
      });
    };
    
    const handleSaveHyperlink = (linkData: { url: string; text: string }) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (hyperlinkData.isEditing) {
            // Remove the existing link first
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
          }
          
          if (selection.isCollapsed()) {
            // No text selected, insert new text with link
            const linkNode = $createLinkNode(linkData.url);
            linkNode.append(new TextNode(linkData.text));
            selection.insertNodes([linkNode]);
          } else {
            // Text selected, apply link to selection
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkData.url);
          }
        }
        setHyperlinkModalOpen(false);
      });
    };
    
    const handleRemoveHyperlink = () => {
      editor.update(() => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        setHyperlinkModalOpen(false);
      });
    };

    // Handler to release a post
    const handleReleasePost = async () => {
        if (!lastSavedPost || !lastSavedPost.published) {
            window.alert('Please publish your post first before releasing it.');
            return;
        }
        
        if (!lastSavedPost.catalog_id) {
            window.alert('Please select a catalog and publish your post before releasing it.');
            setCatalogSelectModalOpen(true);
            return;
        }

        if (setIsPolling) {
            // Check if we're already polling
            const isCurrentlyPolling = document.querySelector('.MuiTypography-caption[color="info.main"]') !== null;
            if (isCurrentlyPolling) {
                window.alert('Please wait while we retrieve the meta-data for your post.');
                return;
            }
        }

        // Get Meta data
        let metaData: MetaData | null = null;
        try {
            metaData = await dataService.getMetaData(lastSavedPost.id || '');
            if (!metaData) {
                window.alert('Failed to retrieve meta-data for the post.');
                return;
            }
        } catch (e: any) {
            window.alert('Failed to retrieve meta-data: ' + (e && e.message ? e.message : e));
            return;
        }

        try {
            // Create the release event detail


            // Send Event to Release Post
            const message = {

                transform: {
                    status: "Content Release Request",
                    event: "content-ready-for-release",
                    post: {
                        key: metaData.source?.key,
                        metadata: {
                            key: lastSavedPost.id
                        },
                        bucket: "",
                        preview_url: metaData.preview?.catalogEntryUri,
                        title: lastSavedPost.title,
                        name: "content-ready-for-release",
                        catalog_id: lastSavedPost.catalog_id
                    }
                },
                source: config.ReleaseEventSource
            }

            // Send the release event
            await dataService.sendReleaseEvent(message);
            window.alert('Release event sent to Event Bus');

            // Poll for updated meta-data
            if (setIsPolling) setIsPolling(true);
            try {
                const metaData = await dataService.pollForMetaData(lastSavedPost.id || '');
                console.log(`Meta-data retrieved after release:`, metaData);

                // Update the post with the meta-data
                const updatedPost = {
                    ...lastSavedPost,
                    released: true,
                    preview: metaData.preview,
                    release: metaData.release,
                    // Ensure catalog information is preserved
                    catalog_id: lastSavedPost.catalog_id,
                    catalog_title: lastSavedPost.catalog_title
                };

                // Update the lastSavedPost with the meta-data
                setLastSavedPost(updatedPost);
                if (onPostLoaded) onPostLoaded(updatedPost);

                // Save the updated post to S3
                await dataService.update(config.StageBucket, lastSavedPost.src || '', updatedPost);
                window.alert('Post released successfully');
            } catch (metaError: any) {
                window.alert('Post released, but failed to retrieve updated meta-data: ' + (metaError && metaError.message ? metaError.message : metaError));
            } finally {
                if (setIsPolling) setIsPolling(false);
            }
        } catch (e: any) {
            window.alert('Failed to release post: ' + (e && e.message ? e.message : e));
            if (setIsPolling) setIsPolling(false);
        }
    };

    // Handler to publish as JSON
    const handlePublishAsJson = async () => {
        if (!lastSavedPost || !lastSavedPost.meta || !lastSavedPost.meta.title || !lastSavedPost.meta.author) {
            window.alert('Please save your post first to set the title, author, and date.');
            return;
        }
        
        if (!selectedCatalogId || !selectedCatalogTitle) {
            window.alert('Please select a catalog before publishing.');
            setCatalogSelectModalOpen(true);
            return;
        }

        // Generate HTML from the editor
        let htmlString = '';
        editor.getEditorState().read(() => {
            htmlString = $generateHtmlFromNodes(editor, null);
        });

        // Parse HTML for images
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const imgElements = doc.querySelectorAll('img');

        // Extract image details and create media objects
        const mediaItems: Array<{
            name: string;
            description: string;
            type: string;
            order: number;
            tags: string[];
            key: string;
        }> = [];

        imgElements.forEach((img, index) => {
            const src = img.getAttribute('src') || '';
            const alt = img.getAttribute('alt') || '';

            // Extract the key from the src URL if it's a media URL
            let key = src;
            if (src.includes(config.MediaProxy)) {
                key = src.replace(`${config.MediaProxy}`, '');
                console.log("Replacing Media Key with New key = "+key);
            }

            //Check if key has one or more forward slashes in front, and remove.
            key = key.replace(/^\//, '');
            if (key.startsWith('/')) {
                key = key.substring(1);
            }

            // Create a media object for each image
            mediaItems.push({
                name: alt || `Image ${index + 1}`,
                description: alt || `Image ${index + 1}`,
                type: 'image',
                order: index + 1,
                tags: [],
                key: key
            });
        });

        // Generate a unique ID for the published data
        const publishedId = uuidv4();

        // Create the published key using the ReadyForPublishPrefix
        console.log(lastSavedPost);
        const publishedKey = `${config.ReadyForPublishPrefix}${lastSavedPost.postKey}.${publishedId}.json`;
        console.log('Publishing as JSON:', publishedKey);
        // Create the JSON export
        const jsonExport: SavedPostData = {
            ...lastSavedPost,
            published: true,
            content: {
                type: 'html',
                body: htmlString
            },
            category: selectedCatalogId,
            media: mediaItems,
            published_data: {
                id: publishedId,
                key: publishedKey,
                published_date: new Date().toISOString()
            },
            srcVersion: lastSavedPost.srcVersion || `v${Date.now()}`, // Use existing srcVersion or generate a placeholder
            key: publishedKey,
            catalog_id: selectedCatalogId,
            catalog_title: selectedCatalogTitle
        };


        try {
            // Save the post to S3

            // Iterate through media items and upload them
            for (const mediaItem of jsonExport.media || []) {
                if (mediaItem.key) {
                    // Use the copyObject method to copy media from StageBucket to PublishBucket
                    await dataService.copyObject(config.StageBucket, mediaItem.key, config.PublishBucket, mediaItem.key);
                }
            }

            await dataService.create(config.PublishBucket, publishedKey, jsonExport);
            window.alert(`JSON published to S3 as ${publishedKey}`);

            // Update the lastSavedPost with the published status
            const initialPublishedPost = {
                ...lastSavedPost,
                published: true,
                published_data: jsonExport.published_data,
                catalog_id: selectedCatalogId,
                catalog_title: selectedCatalogTitle,
            };
            setLastSavedPost(initialPublishedPost);
            if (onPostLoaded) onPostLoaded(initialPublishedPost);

            // Poll for meta-data
            if (setIsPolling) setIsPolling(true);
            try {
                const metaData = await dataService.pollForMetaData(lastSavedPost.id || '');
                console.log(`Meta-data retrieved:`, metaData);

                // Update the post with the meta-data
                const updatedPost = {
                    ...lastSavedPost,
                    published: true,
                    published_data: jsonExport.published_data,
                    preview: metaData.preview,
                    released: metaData.released,
                    release: metaData.release,
                    catalog_id: selectedCatalogId,
                    catalog_title: selectedCatalogTitle
                };

                // Update the lastSavedPost with the meta-data
                setLastSavedPost(updatedPost);
                if (onPostLoaded) onPostLoaded(updatedPost);

                // Save the updated post to S3
                await dataService.update(config.StageBucket, lastSavedPost.src || '', updatedPost);
                window.alert('Post published successfully');
            } catch (metaError: any) {
                window.alert('Post published, but failed to retrieve meta-data: ' + (metaError && metaError.message ? metaError.message : metaError));
            } finally {
                if (setIsPolling) setIsPolling(false);
            }
        } catch (e: any) {
            window.alert('Failed to publish JSON to S3: ' + (e && e.message ? e.message : e));
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
        <Tooltip title="Hyperlink">
          <IconButton size="small" onClick={handleOpenHyperlinkModal} color="primary">
            <LinkIcon />
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
        {/* Catalog Selection Button */}
        <Tooltip title="Select Catalog for Publishing">
          <span>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCatalogSelectModalOpen(true)}
              disabled={!lastSavedPost}
              sx={{ mr: 1 }}
            >
              {selectedCatalogTitle ? `${selectedCatalogTitle}` : "Select Catalog"}
            </Button>
          </span>
        </Tooltip>

        {/* Publish as JSON Button */}
        <Tooltip title={lastSavedPost ? "Publish as HTML" : "Save post first to enable publishing"}>
          <span>
            <IconButton 
              onClick={handlePublishAsJson} 
              size="small" 
              disabled={!lastSavedPost || !selectedCatalogId || document.querySelector('.MuiTypography-caption[color="info.main"]') !== null}
              color={lastSavedPost?.published ? "success" : lastSavedPost ? "primary" : "default"}
            >
              <PublishIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Release Post Button */}
        <Tooltip title={lastSavedPost?.published ? (lastSavedPost?.catalog_id ? "Release Post" : "Select a catalog first") : "Publish post first to enable releasing"}>
          <span>
            <IconButton 
              onClick={handleReleasePost} 
              size="small" 
              disabled={!lastSavedPost?.published || !lastSavedPost?.catalog_id || document.querySelector('.MuiTypography-caption[color="info.main"]') !== null}
              color={lastSavedPost?.released ? "success" : "primary"}
            >
              <SendIcon />
            </IconButton>
          </span>
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
        <SavePostModal 
                  open={saveModalOpen} 
                  onClose={handleSaveModalClose} 
                  onSave={handleSaveModalSave}
                  initialTitle={lastSavedPost?.meta?.title || ''}
                  initialAuthor={lastSavedPost?.meta?.author || ''}
                />
        <CatalogSelectModal
                  open={catalogSelectModalOpen}
                  onClose={() => setCatalogSelectModalOpen(false)}
                  onSelect={(catalogId, catalogTitle) => {
                    setSelectedCatalogId(catalogId);
                    setSelectedCatalogTitle(catalogTitle);
                    setCatalogSelectModalOpen(false);
                  }}
                  dataService={dataService}
                />
        <HyperlinkModal
                  open={hyperlinkModalOpen}
                  onClose={() => setHyperlinkModalOpen(false)}
                  onSave={handleSaveHyperlink}
                  onRemove={handleRemoveHyperlink}
                  initialUrl={hyperlinkData.url}
                  initialText={hyperlinkData.text}
                  isEditing={hyperlinkData.isEditing}
                />
      </Box>
    );
};

export default ToolbarPlugin;
