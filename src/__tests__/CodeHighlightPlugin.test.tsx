import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CodeHighlightPlugin from '../editor/CodeHighlightPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';

// Mock the registerCodeHighlighting function
vi.mock('@lexical/code', () => ({
  registerCodeHighlighting: vi.fn().mockReturnValue(() => {})
}));

describe('CodeHighlightPlugin', () => {
  it('renders without crashing', () => {
    // Setup minimal Lexical editor configuration
    const initialConfig = {
      namespace: 'test-editor',
      onError: (error: Error) => console.error(error),
      nodes: []
    };

    // Render the plugin within LexicalComposer context
    render(
      <LexicalComposer initialConfig={initialConfig}>
        <CodeHighlightPlugin />
      </LexicalComposer>
    );
    
    // No assertion needed as we're just checking it renders without errors
  });
});

