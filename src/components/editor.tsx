import React, { useEffect, useRef } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor = ({ content, onChange }: EditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    // Reset height to calculate proper scrollHeight
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [content]);

  return (
    <div className="editor-container w-full bg-background rounded-lg border p-2">
      <textarea
        ref={editorRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[150px] p-3 bg-transparent resize-none focus:outline-none"
        placeholder="Type your message here..."
      />
    </div>
  );
};

export default Editor;