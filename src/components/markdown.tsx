import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // @ts-expect-error
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  p: ({ node, children, ...props }) => {
    return (
      <p
        className="mb-5 leading-relaxed first:mt-0 last:mb-0"
        style={{
          fontFamily: "'Inter', -apple-system, system-ui",
          fontSize: '15px',
          lineHeight: '1.65',
          color: '#e4e4e7',
        }}
        {...props}
      >
        {children}
      </p>
    );
  },
  ol: ({ node, children, ...props }) => {
    return (
      <ol
        className="list-decimal list-outside ml-6 my-4 space-y-1.5"
        style={{
          lineHeight: '1.65',
          fontSize: '15px',
          color: '#e4e4e7',
        }}
        {...props}
      >
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li
        className="leading-relaxed pl-1.5"
        style={{
          lineHeight: '1.65',
          fontSize: '15px',
        }}
        {...props}
      >
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul
        className="list-disc list-outside ml-6 my-4 space-y-1.5"
        style={{
          lineHeight: '1.65',
          fontSize: '15px',
          color: '#e4e4e7',
        }}
        {...props}
      >
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span
        className="font-semibold"
        style={{ color: '#f4f4f5' }}
        {...props}
      >
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1
        className="font-semibold mt-5 mb-2 first:mt-0"
        style={{
          fontFamily: "'Inter', -apple-system, system-ui",
          fontSize: '20px',
        }}
        {...props}
      >
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2
        className="font-semibold mt-6 mb-3 first:mt-0"
        style={{
          fontFamily: "'Inter', -apple-system, system-ui",
          fontSize: '17px',
          color: '#f4f4f5',
          letterSpacing: '-0.01em',
        }}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3
        className="font-semibold mt-5 mb-2.5 first:mt-0"
        style={{
          fontFamily: "'Inter', -apple-system, system-ui",
          fontSize: '16px',
          color: '#f4f4f5',
        }}
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4
        className="font-semibold mt-4 mb-2 first:mt-0"
        style={{
          fontFamily: "'Inter', -apple-system, system-ui",
          fontSize: '16px',
        }}
        {...props}
      >
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5
        className="font-semibold mt-4 mb-2 first:mt-0"
        style={{
          fontFamily: "'Inter', -apple-system, system-ui",
          fontSize: '15px',
        }}
        {...props}
      >
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6
        className="font-semibold mt-4 mb-2 first:mt-0"
        style={{
          fontFamily: "'Inter', -apple-system, system-ui",
          fontSize: '14px',
        }}
        {...props}
      >
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);