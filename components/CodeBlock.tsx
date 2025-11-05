
import React, { useState } from 'react';
import type { CodeBlockProps } from '../types';
import { ClipboardIcon, CheckIcon } from '../constants';

export const CodeBlock: React.FC<CodeBlockProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-2">
      <pre className="p-4 bg-gray-100 rounded-md text-sm text-gray-800 overflow-x-auto break-words whitespace-pre-wrap font-mono">
        {content}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
        aria-label="Copy to clipboard"
        disabled={!content}
      >
        {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4 text-gray-600" />}
      </button>
    </div>
  );
};
