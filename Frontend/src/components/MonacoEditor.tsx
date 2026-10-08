import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    require?: any;
    monaco?: any;
  }
}

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

function monacoLanguage(language: string) {
  const map: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    typescript: 'typescript',
    java: 'java',
    cpp: 'cpp',
  };
  return map[language] || 'python';
}

export function MonacoEditor({ value, language, onChange }: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const changeRef = useRef(onChange);
  const valueRef = useRef(value);

  changeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    let disposed = false;

    const createEditor = () => {
      if (disposed || !containerRef.current || !window.monaco) return;

      editorRef.current = window.monaco.editor.create(containerRef.current, {
        value: valueRef.current,
        language: monacoLanguage(language),
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        tabSize: 4,
        padding: { top: 12, bottom: 12 },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      });

      editorRef.current.onDidChangeModelContent(() => {
        changeRef.current(editorRef.current.getValue());
      });
    };

    if (window.monaco) {
      createEditor();
    } else if (window.require) {
      window.require.config({
        paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' },
      });
      window.require(['vs/editor/editor.main'], createEditor);
    }

    return () => {
      disposed = true;
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const current = editorRef.current.getValue();
    if (current !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!editorRef.current || !window.monaco) return;
    const model = editorRef.current.getModel();
    if (model) {
      window.monaco.editor.setModelLanguage(model, monacoLanguage(language));
    }
  }, [language]);

  return <div ref={containerRef} className="w-full h-full" />;
}
