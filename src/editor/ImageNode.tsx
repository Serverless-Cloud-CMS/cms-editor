import { DecoratorNode, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import * as React from 'react';
import {JSX} from "react";

export type ImagePayload = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type SerializedImageNode = Spread<
  {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    type: 'image';
    version: 1;
  },
  SerializedLexicalNode
>;

function ImageComponent({ src, alt, width, height, onResize }: { src: string; alt?: string; width?: number; height?: number; onResize?: (w: number, h: number) => void }) {
  const [size, setSize] = React.useState({ width, height });
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Simple resize handler (drag bottom-right corner)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width || imgRef.current?.width || 100;
    const startHeight = size.height || imgRef.current?.height || 100;

    function onMouseMove(ev: MouseEvent) {
      const newWidth = Math.max(20, startWidth + (ev.clientX - startX));
      const newHeight = Math.max(20, startHeight + (ev.clientY - startY));
      setSize({ width: newWidth, height: newHeight });
      onResize && onResize(newWidth, newHeight);
    }
    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <span style={{ display: 'inline-block', position: 'relative' }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        style={{ maxWidth: '100%', width: size.width, height: size.height }}
        width={size.width}
        height={size.height}
      />
      {onResize && (
        <span
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 12,
            height: 12,
            background: '#ccc',
            cursor: 'nwse-resize',
            borderRadius: 2,
            zIndex: 2,
          }}
        />
      )}
    </span>
  );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt?: string;
  __width?: number;
  __height?: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__width, node.__height, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, alt, width, height } = serializedNode;
    return new ImageNode(src, alt, width, height);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
    };
  }

  constructor(src: string, alt?: string, width?: number, height?: number, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    // Provide onResize handler to update node size
    return (
      <ImageComponent
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        onResize={(w, h) => {
          this.__width = w;
          this.__height = h;
        }}
      />
    );
  }

  exportDOM(): {element: HTMLElement} {
    const img = document.createElement('img');
    img.setAttribute('src', this.__src);
    console.log("Exporting ImageNode with width:", this.__width);
    if (this.__alt) {
      img.setAttribute('alt', this.__alt);
    }
    if (this.__width) {
      img.setAttribute('width', String(this.__width));
      img.style.width = this.__width + 'px';
    }
    if (this.__height) {
      img.setAttribute('height', String(this.__height));
      img.style.height = this.__height + 'px';
    }
    img.style.maxWidth = '100%';
    return { element: img };
  }
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  return new ImageNode(payload.src, payload.alt, payload.width, payload.height);
}

export function $isImageNode(node: unknown): node is ImageNode {
  return node instanceof ImageNode;
}
