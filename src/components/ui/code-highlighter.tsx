
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";

interface CodeHighlighterProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language = 'javascript',
  className,
  showLineNumbers = true,
  wrapLines = true,
}) => {
  // Custom theme based on atomDark but with our colors
  const customStyle = {
    ...atomDark,
    'pre[class*="language-"]': {
      ...atomDark['pre[class*="language-"]'],
      background: 'rgba(0, 0, 0, 0.6)',
      border: '1px solid rgba(0, 255, 38, 0.1)',
    },
    'code[class*="language-"]': {
      ...atomDark['code[class*="language-"]'],
      background: 'transparent',
    },
    comment: {
      ...atomDark.comment,
      color: '#666',
    },
    'keyword': {
      ...atomDark.keyword,
      color: '#ff3366',
    },
    'function': {
      ...atomDark.function,
      color: '#f92672',
    },
    'string': {
      ...atomDark.string,
      color: '#a6e22e',
    },
    'number': {
      ...atomDark.number,
      color: '#ae81ff',
    },
  };

  return (
    <div className={cn("relative rounded-md overflow-hidden", className)}>
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers={showLineNumbers}
        wrapLines={wrapLines}
        wrapLongLines={wrapLines}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// Define language detector for Ride (Waves blockchain language)
const defineLanguages = () => {
  // @ts-ignore - SyntaxHighlighter.registerLanguage
  if (SyntaxHighlighter.registerLanguage) {
    // @ts-ignore - SyntaxHighlighter.registerLanguage
    SyntaxHighlighter.registerLanguage('ride', () => ({
      comment: [
        {
          pattern: /(^|[^\\])#.*/,
          lookbehind: true
        }
      ],
      keyword: /\b(let|if|then|else|match|case|func|throw)\b/,
      builtin: /\b(WriteSet|ScriptTransfer|IntegerEntry|StringEntry|BinaryEntry|DeleteEntry)\b/,
      annotation: /\b(@Callable|@Verifier)\b/,
      literal: /\b(true|false|nil|unit)\b/,
      type: /\b(Int|String|Boolean|ByteVector|List|Unit|Address|Asset|DataEntry)\b/,
      function: /\b([a-zA-Z_][a-zA-Z0-9_]*(?=\s*\())\b/,
      number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
      operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
      punctuation: /[{}[\];(),.:]/,
      directive: {
        pattern: /^\s*\{-#[\w\s]+#-\}/m,
        greedy: true
      }
    }));
  }
};

// Define the languages when the component is imported
defineLanguages();

export default CodeHighlighter;
